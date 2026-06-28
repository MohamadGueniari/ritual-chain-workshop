// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PrecompileConsumer} from "./utils/PrecompileConsumer.sol";

interface IRitualWallet {
    function deposit(uint256 lockDuration) external payable;
    function depositFor(address user, uint256 lockDuration) external payable;
    function withdraw(uint256 amount) external;
    function balanceOf(address) external view returns (uint256);
    function lockUntil(address) external view returns (uint256);
}

/**
 * @title CargoManifestJudge
 * @notice A sealed-submission freight terminal for AI-judged bounties on Ritual L1.
 *
 *         Every answer ships as a sealed cargo container. While loading is open
 *         a participant publishes only the container's barcode —
 *         `keccak256(abi.encode(answer, salt, sender, bountyId))` — never the
 *         contents. After the loading cutoff, containers pass customs (reveal):
 *         the barcode is recomputed and the container's on-chain status moves
 *         Sealed -> Opened. After the customs cutoff the owner runs ONE batch
 *         inspection (`judgeAll`) over every Opened container via Ritual's LLM,
 *         the machine recommends a winner, and the human owner signs the release.
 *
 *         What makes this contract its own thing (vs. a plain commit-reveal):
 *         - Each container carries an explicit on-chain `Status` enum
 *           (Sealed / Opened) readable any time — the registry is first-class
 *           state, not derived.
 *         - A `ContainerStatus` enum plus a `manifest`-centric data model
 *           (Manifest holds Containers; counts tracked as openedCount).
 *         - Barcodes are committed with abi.encode (length-prefixed, aligned).
 *         - Custom errors throughout; `cancelManifest` recovers the locked
 *           reward if customs closes with no opened containers.
 *         - `judgeAll` never reverts on an LLM-side failure (a revert would
 *           unwind the async replay and wedge the manifest).
 */
contract CargoManifestJudge is PrecompileConsumer {
    // ----------------------------------------------------------- constants
    uint256 public constant MAX_CONTAINERS = 12;
    uint256 public constant MAX_ANSWER_BYTES = 2_000;
    uint256 public constant NO_WINNER = type(uint256).max;

    IRitualWallet public constant RITUAL_WALLET =
        IRitualWallet(0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948);

    // ----------------------------------------------------------- types
    enum Phase {
        Commit, // loading: accepting sealed containers
        Reveal, // customs: accepting reveals
        Judging, // customs closed, awaiting batch inspection
        Judged, // AI report printed, awaiting release
        Released // winner released, reward paid (or cancelled)
    }

    enum ContainerStatus {
        Sealed, // committed, contents hidden
        Opened // revealed and verified at customs
    }

    struct Container {
        address shipper; // the participant
        bytes32 barcode; // commitment hash
        ContainerStatus status;
        string contents; // empty until opened
    }

    struct Manifest {
        address owner;
        string title;
        string rubric;
        uint256 reward;
        uint64 loadingCutoff; // containers accepted strictly before this (ms)
        uint64 customsCutoff; // reveals accepted in [loadingCutoff, customsCutoff) (ms)
        bool inspected;
        bool released;
        bool cancelled;
        uint256 winner; // NO_WINNER until released
        uint256 openedCount;
        bytes report; // raw LLM completion (advisory)
        Container[] containers;
    }

    // The conversation-history tuple the LLM precompile appends to its response.
    struct ConvoHistory {
        string storageType;
        string path;
        string secretsName;
    }

    // ----------------------------------------------------------- storage
    uint256 public nextManifestId = 1;
    mapping(uint256 => Manifest) private _manifests;
    // manifestId => shipper => 1-based container index (0 = none)
    mapping(uint256 => mapping(address => uint256)) private _containerSlot;

    // ----------------------------------------------------------- events
    event ManifestCreated(
        uint256 indexed manifestId,
        address indexed owner,
        string title,
        uint256 reward,
        uint64 loadingCutoff,
        uint64 customsCutoff
    );
    event CargoSealed(uint256 indexed manifestId, uint256 indexed containerIndex, address indexed shipper, bytes32 barcode);
    event CargoOpened(uint256 indexed manifestId, uint256 indexed containerIndex, address indexed shipper);
    event BatchInspected(uint256 indexed manifestId, uint256 openedCount, bytes report);
    event WinnerReleased(uint256 indexed manifestId, uint256 indexed winner, address indexed shipper, uint256 reward);
    event ManifestCancelled(uint256 indexed manifestId, address indexed owner, uint256 reward);

    // ----------------------------------------------------------- errors
    error NotOwner();
    error UnknownManifest();
    error RewardRequired();
    error BadCutoffs();
    error LoadingClosed();
    error EmptyBarcode();
    error AlreadyShipped();
    error ManifestFull();
    error CustomsNotOpen();
    error CustomsClosed();
    error BadAnswerLength();
    error NoContainer();
    error AlreadyOpened();
    error BarcodeMismatch();
    error CustomsNotFinished();
    error AlreadyInspected();
    error AlreadyReleased();
    error NoOpenedContainers();
    error NotInspected();
    error BadIndex();
    error WinnerNotOpened();
    error PayoutFailed();
    error CannotCancel();

    // ----------------------------------------------------------- modifiers
    modifier onlyOwner(uint256 manifestId) {
        if (msg.sender != _manifests[manifestId].owner) revert NotOwner();
        _;
    }

    modifier exists(uint256 manifestId) {
        if (_manifests[manifestId].owner == address(0)) revert UnknownManifest();
        _;
    }

    // ----------------------------------------------------------- create
    function createBounty(
        string calldata title,
        string calldata rubric,
        uint256 submissionDeadline,
        uint256 revealDeadline
    ) external payable returns (uint256 manifestId) {
        if (msg.value == 0) revert RewardRequired();
        if (submissionDeadline <= block.timestamp) revert BadCutoffs();
        if (revealDeadline <= submissionDeadline) revert BadCutoffs();

        manifestId = nextManifestId++;
        Manifest storage mf = _manifests[manifestId];
        mf.owner = msg.sender;
        mf.title = title;
        mf.rubric = rubric;
        mf.reward = msg.value;
        mf.loadingCutoff = uint64(submissionDeadline);
        mf.customsCutoff = uint64(revealDeadline);
        mf.winner = NO_WINNER;

        emit ManifestCreated(manifestId, msg.sender, title, msg.value, mf.loadingCutoff, mf.customsCutoff);
    }

    // --------------------------------------------------- required: commit
    function submitCommitment(uint256 manifestId, bytes32 commitment) external exists(manifestId) {
        Manifest storage mf = _manifests[manifestId];
        if (block.timestamp >= mf.loadingCutoff) revert LoadingClosed();
        if (commitment == bytes32(0)) revert EmptyBarcode();
        if (_containerSlot[manifestId][msg.sender] != 0) revert AlreadyShipped();
        if (mf.containers.length >= MAX_CONTAINERS) revert ManifestFull();

        mf.containers.push(
            Container({shipper: msg.sender, barcode: commitment, status: ContainerStatus.Sealed, contents: ""})
        );
        uint256 index = mf.containers.length - 1;
        _containerSlot[manifestId][msg.sender] = index + 1; // 1-based

        emit CargoSealed(manifestId, index, msg.sender, commitment);
    }

    // --------------------------------------------------- required: reveal
    function revealAnswer(uint256 manifestId, string calldata answer, bytes32 salt) external exists(manifestId) {
        Manifest storage mf = _manifests[manifestId];
        if (block.timestamp < mf.loadingCutoff) revert CustomsNotOpen();
        if (block.timestamp >= mf.customsCutoff) revert CustomsClosed();

        uint256 len = bytes(answer).length;
        if (len == 0 || len > MAX_ANSWER_BYTES) revert BadAnswerLength();

        uint256 slot = _containerSlot[manifestId][msg.sender];
        if (slot == 0) revert NoContainer();

        Container storage c = mf.containers[slot - 1];
        if (c.status == ContainerStatus.Opened) revert AlreadyOpened();

        // abi.encode (not encodePacked) — the client must match exactly.
        if (keccak256(abi.encode(answer, salt, msg.sender, manifestId)) != c.barcode) revert BarcodeMismatch();

        c.contents = answer;
        c.status = ContainerStatus.Opened;
        mf.openedCount += 1;

        emit CargoOpened(manifestId, slot - 1, msg.sender);
    }

    // --------------------------------------------------- required: judge
    /// @param llmInput ABI-encoded Ritual LLM request carrying ALL opened
    ///        containers in ONE batch (built off-chain). Empty on non-Ritual chains.
    function judgeAll(uint256 manifestId, bytes calldata llmInput) external exists(manifestId) onlyOwner(manifestId) {
        Manifest storage mf = _manifests[manifestId];
        if (block.timestamp < mf.customsCutoff) revert CustomsNotFinished();
        if (mf.inspected) revert AlreadyInspected();
        if (mf.released) revert AlreadyReleased();
        if (mf.openedCount == 0) revert NoOpenedContainers();

        if (llmInput.length > 0) {
            bytes memory output = _executePrecompile(LLM_INFERENCE_PRECOMPILE, llmInput);
            if (output.length > 0) {
                // Do NOT revert on an LLM-side error: a revert would unwind the
                // entire async replay (including inspected=true) and wedge the
                // manifest. Store the report only when the model is clean.
                (bool hasError, bytes memory completion,,,) =
                    abi.decode(output, (bool, bytes, bytes, string, ConvoHistory));
                if (!hasError) {
                    mf.report = completion;
                }
            }
        }

        mf.inspected = true;
        emit BatchInspected(manifestId, mf.openedCount, mf.report);
    }

    // --------------------------------------------------- required: finalize
    function finalizeWinner(uint256 manifestId, uint256 winnerIndex) external exists(manifestId) onlyOwner(manifestId) {
        Manifest storage mf = _manifests[manifestId];
        if (!mf.inspected) revert NotInspected();
        if (mf.released) revert AlreadyReleased();
        if (winnerIndex >= mf.containers.length) revert BadIndex();

        Container storage win = mf.containers[winnerIndex];
        if (win.status != ContainerStatus.Opened) revert WinnerNotOpened();

        mf.released = true;
        mf.winner = winnerIndex;

        uint256 reward = mf.reward;
        mf.reward = 0;
        (bool ok, ) = payable(win.shipper).call{value: reward}("");
        if (!ok) revert PayoutFailed();

        emit WinnerReleased(manifestId, winnerIndex, win.shipper, reward);
    }

    // --------------------------------------------------- escape hatch
    /// @notice If customs closed with zero opened containers, the owner can
    ///         recover the locked reward instead of it being stranded.
    function cancelManifest(uint256 manifestId) external exists(manifestId) onlyOwner(manifestId) {
        Manifest storage mf = _manifests[manifestId];
        if (mf.released || mf.cancelled) revert AlreadyReleased();
        if (block.timestamp < mf.customsCutoff) revert CannotCancel();
        if (mf.openedCount != 0) revert CannotCancel();

        mf.cancelled = true;
        mf.released = true;
        uint256 reward = mf.reward;
        mf.reward = 0;
        (bool ok, ) = payable(mf.owner).call{value: reward}("");
        if (!ok) revert PayoutFailed();

        emit ManifestCancelled(manifestId, mf.owner, reward);
    }

    // ----------------------------------------------------------- views
    function phaseOf(uint256 manifestId) public view exists(manifestId) returns (Phase) {
        Manifest storage mf = _manifests[manifestId];
        if (mf.released) return Phase.Released;
        if (mf.inspected) return Phase.Judged;
        if (block.timestamp < mf.loadingCutoff) return Phase.Commit;
        if (block.timestamp < mf.customsCutoff) return Phase.Reveal;
        return Phase.Judging;
    }

    function getBounty(uint256 manifestId)
        external
        view
        exists(manifestId)
        returns (
            address owner,
            string memory title,
            string memory rubric,
            uint256 reward,
            uint256 submissionDeadline,
            uint256 revealDeadline,
            bool judged,
            bool finalized,
            uint256 submissionCount,
            uint256 revealedCount,
            uint256 winnerIndex,
            bytes memory aiReport
        )
    {
        Manifest storage mf = _manifests[manifestId];
        return (
            mf.owner,
            mf.title,
            mf.rubric,
            mf.reward,
            mf.loadingCutoff,
            mf.customsCutoff,
            mf.inspected,
            mf.released,
            mf.containers.length,
            mf.openedCount,
            mf.winner,
            mf.report
        );
    }

    function getSubmission(uint256 manifestId, uint256 index)
        external
        view
        exists(manifestId)
        returns (address shipper, bytes32 barcode, bool opened, string memory contents)
    {
        Manifest storage mf = _manifests[manifestId];
        if (index >= mf.containers.length) revert BadIndex();
        Container storage c = mf.containers[index];
        return (c.shipper, c.barcode, c.status == ContainerStatus.Opened, c.contents);
    }

    function containerStatus(uint256 manifestId, uint256 index)
        external
        view
        exists(manifestId)
        returns (ContainerStatus)
    {
        Manifest storage mf = _manifests[manifestId];
        if (index >= mf.containers.length) revert BadIndex();
        return mf.containers[index].status;
    }

    function entrySlot(uint256 manifestId, address shipper) external view returns (uint256) {
        return _containerSlot[manifestId][shipper];
    }

    function entryCount(uint256 manifestId) external view exists(manifestId) returns (uint256) {
        return _manifests[manifestId].containers.length;
    }

    /// @notice Build a barcode exactly like the contract does (abi.encode).
    function computeCommitment(
        string calldata answer,
        bytes32 salt,
        address shipper,
        uint256 manifestId
    ) external pure returns (bytes32) {
        return keccak256(abi.encode(answer, salt, shipper, manifestId));
    }
}
