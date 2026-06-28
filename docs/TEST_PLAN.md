# Test Plan — Blind Cargo Judge

Suite: `hardhat/contracts/CargoManifestJudge.t.sol`
Run:   `cd hardhat && npx hardhat test solidity`
Result: **32 passing.**

Custom errors are asserted with `vm.expectRevert(CargoManifestJudge.<Error>.selector)`;
time advanced with `vm.warp`, accounts funded with `vm.deal`.

Legend:  [✓] happy path   [×] must revert   [≈] property/observation

---

## 1 · Sealing (commit)

```
[✓] test_SubmitCommitment          a sealed container is recorded; status = Sealed
[×] test_RevertCommit_Twice        same address ships twice        → AlreadyShipped
[×] test_RevertCommit_AfterCutoff  ship past the loading cutoff     → LoadingClosed
[×] test_RevertCommit_Empty        zero barcode                     → EmptyBarcode
[×] test_RevertCommit_UnknownManifest  ship to a missing manifest   → UnknownManifest
```

## 2 · Customs (reveal) — the core of the assignment

```
[✓] test_RevealValid               in-window reveal, correct key → status Opened,
                                   contents stored, container eligible
[≈] test_ContentsHiddenBeforeReveal  before reveal: opened=false, contents="" —
                                     proof the answer is not on-chain

[×] test_RevertReveal_WrongAnswer  wrong answer                     → BarcodeMismatch
[×] test_RevertReveal_WrongSalt    wrong salt                       → BarcodeMismatch
[×] test_StolenBarcodeCannotBeRevealed  reveal another's barcode under
                                        your address → BarcodeMismatch (sender bound)
[×] test_RevertReveal_EmptyAnswer  empty answer                     → BadAnswerLength

[×] test_RevertReveal_BeforeWindow reveal during loading            → CustomsNotOpen
[×] test_RevertReveal_AfterWindow  reveal after customs closes       → CustomsClosed
[×] test_RevertReveal_NoContainer  reveal with no container         → NoContainer
[×] test_RevertReveal_Twice        reveal an already-opened container → AlreadyOpened
```

## 3 · Inspection (judge)

```
[✓] test_JudgeAll_NonRitualChain   empty llmInput off Ritual → inspected, phase Judged
[×] test_RevertJudge_NotOwner      non-host runs inspection         → NotOwner
[×] test_RevertJudge_BeforeCustomsCutoff  inspect too early          → CustomsNotFinished
[×] test_RevertJudge_NoOpened      inspect with zero opened cargo    → NoOpenedContainers
[×] test_RevertJudge_Twice         inspect again                    → AlreadyInspected
```

## 4 · Release (finalize)

```
[✓] test_Finalize_PaysWinner       reward paid, phase = Released, winner set
[×] test_RevertFinalize_BeforeJudge  release before inspection       → NotInspected
[×] test_RevertFinalize_UnopenedWinner  pick an unopened container   → WinnerNotOpened
```

## 5 · Create & cancel

```
[✓] test_CreateManifest            funded, winner = NO_WINNER, phase = Commit
[×] test_RevertCreate_NoReward     no prize attached                → RewardRequired
[×] test_RevertCreate_BadCutoffs   customs ≤ loading                → BadCutoffs
[×] test_RevertCreate_CutoffInPast loading in the past              → BadCutoffs

[✓] test_CancelManifest_WhenNoneOpened   no opened cargo after customs → host refunded
[×] test_RevertCancel_WhenSomeoneOpened  an opened container exists    → CannotCancel
[×] test_RevertCancel_BeforeCustomsCutoff  too early                   → CannotCancel
```

## 6 · Parity & end-to-end

```
[≈] test_ComputeCommitmentMatches  on-chain computeCommitment == off-chain
                                   keccak256(abi.encode(...))
[✓] test_FullLifecycle             create → seal → reveal → inspect → release
```

---

## 7 · Live on Ritual L1 (manual)

Deployed: `0x679666151d5C2c329a23f5E23C659C383d5DAf2F`

```
1. createBounty with MILLISECOND deadlines (Ritual block.timestamp is ms)
2. seal cargo from 2 addresses → getSubmission shows empty contents
3. after loading cutoff: reveal — wrong salt reverts, correct one opens container
4. after customs cutoff: deposit ~0.4 RITUAL into RitualWallet, then
   judgeAll WITH gas: 6_000_000 → read `report` from getBounty
5. finalizeWinner → reward lands with the chosen opened shipper
6. edge: let customs lapse with zero opened cargo → cancelManifest refunds host
```

The frontend↔contract barcode parity check was run against this live deployment
and matched byte-for-byte.
