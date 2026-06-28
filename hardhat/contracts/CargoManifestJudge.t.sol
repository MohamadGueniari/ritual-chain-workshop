// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CargoManifestJudge} from "./CargoManifestJudge.sol";

contract CargoManifestJudgeTest is Test {
    CargoManifestJudge internal judge;

    address internal owner = address(0xCA460);
    address internal alice = address(0xA1);
    address internal bob = address(0xB0B);
    address internal carol = address(0xCA401);

    uint256 internal loadingCutoff;
    uint256 internal customsCutoff;

    function setUp() public {
        judge = new CargoManifestJudge();
        vm.deal(owner, 100 ether);
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        vm.deal(carol, 1 ether);
        loadingCutoff = block.timestamp + 1 days;
        customsCutoff = block.timestamp + 2 days;
    }

    function _create() internal returns (uint256 id) {
        vm.prank(owner);
        id = judge.createBounty{value: 5 ether}("Freight idea", "clarity + originality", loadingCutoff, customsCutoff);
    }

    function _barcode(string memory answer, bytes32 salt, address who, uint256 id) internal pure returns (bytes32) {
        return keccak256(abi.encode(answer, salt, who, id));
    }

    // ---- create ----

    function test_CreateManifest() public {
        uint256 id = _create();
        (address o,,, uint256 reward,,,,,,, uint256 winner,) = judge.getBounty(id);
        assertEq(o, owner);
        assertEq(reward, 5 ether);
        assertEq(winner, judge.NO_WINNER());
        assertEq(uint256(judge.phaseOf(id)), uint256(CargoManifestJudge.Phase.Commit));
    }

    function test_RevertCreate_NoReward() public {
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.RewardRequired.selector);
        judge.createBounty{value: 0}("t", "r", loadingCutoff, customsCutoff);
    }

    function test_RevertCreate_BadCutoffs() public {
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.BadCutoffs.selector);
        judge.createBounty{value: 1 ether}("t", "r", customsCutoff, loadingCutoff);
    }

    function test_RevertCreate_CutoffInPast() public {
        vm.warp(1000);
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.BadCutoffs.selector);
        judge.createBounty{value: 1 ether}("t", "r", 999, 2000);
    }

    // ---- commit ----

    function test_SubmitCommitment() public {
        uint256 id = _create();
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("a", bytes32(uint256(1)), alice, id));
        assertEq(judge.entryCount(id), 1);
        assertEq(uint256(judge.containerStatus(id, 0)), uint256(CargoManifestJudge.ContainerStatus.Sealed));
    }

    function test_RevertCommit_Twice() public {
        uint256 id = _create();
        vm.startPrank(alice);
        judge.submitCommitment(id, _barcode("a", bytes32(uint256(1)), alice, id));
        vm.expectRevert(CargoManifestJudge.AlreadyShipped.selector);
        judge.submitCommitment(id, _barcode("a", bytes32(uint256(1)), alice, id));
        vm.stopPrank();
    }

    function test_RevertCommit_AfterCutoff() public {
        uint256 id = _create();
        vm.warp(loadingCutoff + 1);
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.LoadingClosed.selector);
        judge.submitCommitment(id, _barcode("a", bytes32(uint256(1)), alice, id));
    }

    function test_RevertCommit_Empty() public {
        uint256 id = _create();
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.EmptyBarcode.selector);
        judge.submitCommitment(id, bytes32(0));
    }

    function test_RevertCommit_UnknownManifest() public {
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.UnknownManifest.selector);
        judge.submitCommitment(999, _barcode("a", bytes32(uint256(1)), alice, 999));
    }

    // ---- reveal: valid ----

    function test_RevealValid() public {
        uint256 id = _create();
        bytes32 salt = bytes32(uint256(42));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("the answer", salt, alice, id));
        vm.warp(loadingCutoff + 1);
        assertEq(uint256(judge.phaseOf(id)), uint256(CargoManifestJudge.Phase.Reveal));
        vm.prank(alice);
        judge.revealAnswer(id, "the answer", salt);
        (,, bool opened, string memory ans) = judge.getSubmission(id, 0);
        assertTrue(opened);
        assertEq(ans, "the answer");
        assertEq(uint256(judge.containerStatus(id, 0)), uint256(CargoManifestJudge.ContainerStatus.Opened));
    }

    function test_ContentsHiddenBeforeReveal() public {
        uint256 id = _create();
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("secret answer", bytes32(uint256(9)), alice, id));
        (,, bool opened, string memory ans) = judge.getSubmission(id, 0);
        assertFalse(opened);
        assertEq(bytes(ans).length, 0);
    }

    // ---- reveal: invalid ----

    function test_RevertReveal_WrongAnswer() public {
        uint256 id = _create();
        bytes32 salt = bytes32(uint256(42));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("the answer", salt, alice, id));
        vm.warp(loadingCutoff + 1);
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.BarcodeMismatch.selector);
        judge.revealAnswer(id, "WRONG", salt);
    }

    function test_RevertReveal_WrongSalt() public {
        uint256 id = _create();
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("the answer", bytes32(uint256(42)), alice, id));
        vm.warp(loadingCutoff + 1);
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.BarcodeMismatch.selector);
        judge.revealAnswer(id, "the answer", bytes32(uint256(99)));
    }

    function test_StolenBarcodeCannotBeRevealed() public {
        uint256 id = _create();
        bytes32 salt = bytes32(uint256(42));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("the answer", salt, alice, id));
        vm.prank(bob);
        judge.submitCommitment(id, _barcode("bob ans", salt, bob, id));
        vm.warp(loadingCutoff + 1);
        vm.prank(bob);
        vm.expectRevert(CargoManifestJudge.BarcodeMismatch.selector);
        judge.revealAnswer(id, "the answer", salt);
    }

    function test_RevertReveal_BeforeWindow() public {
        uint256 id = _create();
        bytes32 salt = bytes32(uint256(42));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("the answer", salt, alice, id));
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.CustomsNotOpen.selector);
        judge.revealAnswer(id, "the answer", salt);
    }

    function test_RevertReveal_AfterWindow() public {
        uint256 id = _create();
        bytes32 salt = bytes32(uint256(42));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("the answer", salt, alice, id));
        vm.warp(customsCutoff + 1);
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.CustomsClosed.selector);
        judge.revealAnswer(id, "the answer", salt);
    }

    function test_RevertReveal_NoContainer() public {
        uint256 id = _create();
        vm.warp(loadingCutoff + 1);
        vm.prank(carol);
        vm.expectRevert(CargoManifestJudge.NoContainer.selector);
        judge.revealAnswer(id, "x", bytes32(uint256(1)));
    }

    function test_RevertReveal_Twice() public {
        uint256 id = _create();
        bytes32 salt = bytes32(uint256(42));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("the answer", salt, alice, id));
        vm.warp(loadingCutoff + 1);
        vm.startPrank(alice);
        judge.revealAnswer(id, "the answer", salt);
        vm.expectRevert(CargoManifestJudge.AlreadyOpened.selector);
        judge.revealAnswer(id, "the answer", salt);
        vm.stopPrank();
    }

    function test_RevertReveal_EmptyAnswer() public {
        uint256 id = _create();
        bytes32 salt = bytes32(uint256(42));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("", salt, alice, id));
        vm.warp(loadingCutoff + 1);
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.BadAnswerLength.selector);
        judge.revealAnswer(id, "", salt);
    }

    // ---- judge & finalize ----

    function _twoOpened() internal returns (uint256 id) {
        id = _create();
        bytes32 sa = bytes32(uint256(1));
        bytes32 sb = bytes32(uint256(2));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("alice answer", sa, alice, id));
        vm.prank(bob);
        judge.submitCommitment(id, _barcode("bob answer", sb, bob, id));
        vm.warp(loadingCutoff + 1);
        vm.prank(alice);
        judge.revealAnswer(id, "alice answer", sa);
        vm.prank(bob);
        judge.revealAnswer(id, "bob answer", sb);
    }

    function test_JudgeAll_NonRitualChain() public {
        uint256 id = _twoOpened();
        vm.warp(customsCutoff + 1);
        assertEq(uint256(judge.phaseOf(id)), uint256(CargoManifestJudge.Phase.Judging));
        vm.prank(owner);
        judge.judgeAll(id, hex"");
        (,,,,,, bool judged,,,,,) = judge.getBounty(id);
        assertTrue(judged);
        assertEq(uint256(judge.phaseOf(id)), uint256(CargoManifestJudge.Phase.Judged));
    }

    function test_RevertJudge_NotOwner() public {
        uint256 id = _twoOpened();
        vm.warp(customsCutoff + 1);
        vm.prank(alice);
        vm.expectRevert(CargoManifestJudge.NotOwner.selector);
        judge.judgeAll(id, hex"");
    }

    function test_RevertJudge_BeforeCustomsCutoff() public {
        uint256 id = _twoOpened();
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.CustomsNotFinished.selector);
        judge.judgeAll(id, hex"");
    }

    function test_RevertJudge_NoOpened() public {
        uint256 id = _create();
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("x", bytes32(uint256(1)), alice, id));
        vm.warp(customsCutoff + 1);
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.NoOpenedContainers.selector);
        judge.judgeAll(id, hex"");
    }

    function test_RevertJudge_Twice() public {
        uint256 id = _twoOpened();
        vm.warp(customsCutoff + 1);
        vm.startPrank(owner);
        judge.judgeAll(id, hex"");
        vm.expectRevert(CargoManifestJudge.AlreadyInspected.selector);
        judge.judgeAll(id, hex"");
        vm.stopPrank();
    }

    function test_Finalize_PaysWinner() public {
        uint256 id = _twoOpened();
        vm.warp(customsCutoff + 1);
        vm.prank(owner);
        judge.judgeAll(id, hex"");
        uint256 before = bob.balance;
        vm.prank(owner);
        judge.finalizeWinner(id, 1);
        assertEq(bob.balance, before + 5 ether);
        (,,,,,,, bool released,,, uint256 winner,) = judge.getBounty(id);
        assertTrue(released);
        assertEq(winner, 1);
        assertEq(uint256(judge.phaseOf(id)), uint256(CargoManifestJudge.Phase.Released));
    }

    function test_RevertFinalize_BeforeJudge() public {
        uint256 id = _twoOpened();
        vm.warp(customsCutoff + 1);
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.NotInspected.selector);
        judge.finalizeWinner(id, 0);
    }

    function test_RevertFinalize_UnopenedWinner() public {
        uint256 id = _create();
        bytes32 sa = bytes32(uint256(1));
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("alice answer", sa, alice, id));
        vm.prank(carol);
        judge.submitCommitment(id, _barcode("carol", bytes32(uint256(9)), carol, id));
        vm.warp(loadingCutoff + 1);
        vm.prank(alice);
        judge.revealAnswer(id, "alice answer", sa);
        vm.warp(customsCutoff + 1);
        vm.prank(owner);
        judge.judgeAll(id, hex"");
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.WinnerNotOpened.selector);
        judge.finalizeWinner(id, 1); // carol never opened
    }

    // ---- cancel ----

    function test_CancelManifest_WhenNoneOpened() public {
        uint256 id = _create();
        vm.prank(alice);
        judge.submitCommitment(id, _barcode("x", bytes32(uint256(1)), alice, id));
        vm.warp(customsCutoff + 1);
        uint256 before = owner.balance;
        vm.prank(owner);
        judge.cancelManifest(id);
        assertEq(owner.balance, before + 5 ether);
        (,,,,,,, bool released,,,,) = judge.getBounty(id);
        assertTrue(released);
    }

    function test_RevertCancel_WhenSomeoneOpened() public {
        uint256 id = _twoOpened();
        vm.warp(customsCutoff + 1);
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.CannotCancel.selector);
        judge.cancelManifest(id);
    }

    function test_RevertCancel_BeforeCustomsCutoff() public {
        uint256 id = _create();
        vm.prank(owner);
        vm.expectRevert(CargoManifestJudge.CannotCancel.selector);
        judge.cancelManifest(id);
    }

    // ---- helpers ----

    function test_ComputeCommitmentMatches() public view {
        bytes32 a = judge.computeCommitment("hello", bytes32(uint256(7)), alice, 1);
        bytes32 b = _barcode("hello", bytes32(uint256(7)), alice, 1);
        assertEq(a, b);
    }

    function test_FullLifecycle() public {
        uint256 id = _twoOpened();
        vm.warp(customsCutoff + 1);
        vm.startPrank(owner);
        judge.judgeAll(id, hex"");
        judge.finalizeWinner(id, 0);
        vm.stopPrank();
        (,,,,,,, bool released,,, uint256 winner,) = judge.getBounty(id);
        assertTrue(released);
        assertEq(winner, 0);
    }
}
