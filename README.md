============================================================
 BLIND CARGO JUDGE  ·  Sealed Submission Freight System
 Privacy-preserving, AI-judged bounties on Ritual L1
============================================================

Answers move through this repo like freight through a secure terminal. While a
bounty is loading, an answer is packed into a sealed container and only its
barcode ships on-chain. After the loading cutoff the container clears customs
(reveal); after the customs cutoff every cleared container goes through one
batch inspection by the Ritual AI, which recommends a winner — and a human owner
signs the release manifest to pay.

   private answer
        │  pack
        ▼
   sealed container ──barcode──▶ on-chain
        │  customs (reveal)
        ▼
   opened container ──┐
                      ├──▶ one batch inspection ──▶ AI report
   opened container ──┘
                      │  human signs release
                      ▼
                   reward paid

LIVE TERMINAL ....... https://mohamadgueniari.github.io/ritual-chain-workshop/
CONTRACT (Ritual) ... 0x679666151d5C2c329a23f5E23C659C383d5DAf2F
DEPLOY TX ........... 0x9d085f13ab692a3771ed50df69c1d4dc179d561ec481f98f93c5d401c6ba1c62
TESTS ............... 32 passing (hardhat/contracts/CargoManifestJudge.t.sol)


------------------------------------------------------------
 WHY SEAL THE CARGO
------------------------------------------------------------

If answers were visible the moment they shipped, a latecomer could read the
first good idea, append one line, and take the prize. So nothing readable ships
during loading — only an irreversible barcode:

   barcode = keccak256(abi.encode(answer, salt, msg.sender, manifestId))

   answer ........ your real submission; stays off-chain until customs
   salt .......... your private customs key; without it the container won't open
   msg.sender .... binds the container to you (no re-shipping someone else's)
   manifestId .... binds it to this manifest (no replay across jobs)

A keccak hash can't be inverted, so observers see noise. At customs you hand back
answer + salt; the terminal recomputes the barcode and the container only opens
on an exact match. The frontend hashes with the identical abi.encode and was
verified byte-for-byte against the contract's on-chain computeCommitment.


------------------------------------------------------------
 TERMINAL PHASES
------------------------------------------------------------

phaseOf(manifestId) reports the live phase:

   COMMIT    loading      accepting sealed containers
   REVEAL    customs      accepting reveals (barcode rescan)
   JUDGING   closed       customs shut, awaiting batch inspection
   JUDGED    report in    AI recommendation stored, awaiting release
   RELEASED  done         winner released, reward paid (or cancelled)

Containers carry their own on-chain status enum (Sealed / Opened), so the cargo
registry is first-class state — not something derived off-chain.


------------------------------------------------------------
 OPERATIONS (required entry points)
------------------------------------------------------------

   submitCommitment(manifestId, commitment)        # seal cargo
   revealAnswer(manifestId, answer, salt)          # clear customs
   judgeAll(manifestId, llmInput)                  # batch inspection
   finalizeWinner(manifestId, winnerIndex)         # sign release

   createBounty(title, rubric, subDeadline, revDeadline) payable
   cancelManifest(manifestId)                       # recover reward if nothing opened
   getBounty / getSubmission / containerStatus / phaseOf / computeCommitment


------------------------------------------------------------
 GATE RULES (enforced on-chain)
------------------------------------------------------------

   [x] seal only before the loading cutoff
   [x] one container per address per manifest
   [x] reveal only inside [loadingCutoff, customsCutoff)
   [x] a container opens only if its barcode matches
   [x] sealed / unopened containers are ineligible
   [x] inspect only after customs closes
   [x] release is owner-only, only after inspection
   [x] reward paid once, to a single winner, then zeroed
   [x] cancelManifest recovers a reward if no container ever opened

Failures use custom errors (BarcodeMismatch, CustomsNotOpen, NoOpenedContainers,
AlreadyInspected, …). judgeAll never reverts on an LLM-side error — a revert
would unwind the async replay and wedge the manifest, so the report is stored
only on a clean model response and the human still releases.


------------------------------------------------------------
 RITUAL FIELD NOTES
------------------------------------------------------------

   TIME    block.timestamp is in MILLISECONDS. Every deadline and countdown is ms.
   GAS     judgeAll pins gas = 6,000,000. The async replay that decodes the LLM
           result and writes it to storage costs ~1.09M gas; an auto-estimate
           covers only the cheap first pass and dies mid-replay.
   FUEL    the LLM precompile (0x0802, GLM-4.7-FP8) charges a prepaid escrow in
           the RitualWallet (0x532F0dF0…), locked past the async callback.
           Worst-case ≈ 0.31 RITUAL; the UI deposits ≈ 0.4 with margin.


------------------------------------------------------------
 THE TERMINAL UI
------------------------------------------------------------

Not a dashboard. A left vertical cargo route (10 checkpoint plates, the active
one slides out and lights Safety Yellow), a center cargo bay that re-tools its
machinery per stage, a right stack of layered shipping manifests, and a bottom
conveyor belt where events ride past as crates. Checkpoints unlock by phase and
clock; the app auto-advances as deadlines elapse; an always-on countdown bar
shows time to the next gate.

The host page background is never replaced — the steel terminal veil is layered
on top of it.

Stack: React + Vite + TypeScript + Tailwind v4 + Radix + Motion + viem. No
wagmi, no mocks; the UI talks straight to the deployed contract via one viem
service.


------------------------------------------------------------
 RUN
------------------------------------------------------------

   # contract
   cd hardhat
   npm install
   npx hardhat test solidity            # 32 passing
   npx hardhat ignition deploy ignition/modules/CargoManifestJudge.ts --network ritual

   # frontend
   cd web
   npm install
   cp .env.example .env                 # defaults point at the live deployment
   npm run dev                          # http://localhost:5173


------------------------------------------------------------
 LAYOUT
------------------------------------------------------------

   hardhat/contracts/CargoManifestJudge.sol     the freight terminal contract
   hardhat/contracts/CargoManifestJudge.t.sol   32 tests
   web/src/components/  layout · stages · cargo · modals · feedback · ui
   web/src/services/    web3BountyService (live Ritual contract)
   web/src/store/       useCargoStore (Zustand) — phases + auto-transitions
   web/src/lib/         crypto · ritualLlm · ritualWallet · stages

Forked from the Ritual workshop starter; rebuilt as its own freight terminal.
AI recommends. Owner releases.
