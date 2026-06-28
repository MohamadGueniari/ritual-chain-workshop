# Architecture — Blind Cargo Judge

System design of the freight terminal: the data model, the trust boundary, and
the inspection pipeline. Written as an operations spec.

---

## A. Data custody table

Who holds what, and when.

| Asset | Loading (Commit) | Customs (Reveal) | After release |
|-------|------------------|------------------|---------------|
| answer (plaintext) | shipper's device only | sent to contract, stored | on-chain, public |
| salt (customs key) | shipper's device only | sent to contract | on-chain, public |
| barcode (hash) | on-chain | on-chain | on-chain |
| reward | locked in contract | locked in contract | paid to winner |
| AI report | — | — | on-chain (`report`) |

The single invariant that makes this private: **during loading the chain holds
only the barcode.** `getSubmission` returns an empty `contents` string for every
sealed container; the plaintext appears only after a verified customs reveal.

---

## B. The barcode

```
barcode = keccak256(abi.encode(answer, salt, msg.sender, manifestId))
```

`abi.encode` (not `encodePacked`) is used so the dynamic `answer` string is
length-prefixed and 32-byte aligned — no boundary ambiguity between adjacent
dynamic fields. Field bindings:

- `answer` — the committed contents.
- `salt` — entropy that blocks brute-forcing a short answer out of the hash.
- `msg.sender` — anti-theft: a copied barcode can't be revealed by a different
  shipper (the recomputed hash diverges).
- `manifestId` — anti-replay: a barcode is scoped to one manifest.

Client/contract parity was verified live: the frontend's `keccak256(abi.encode…)`
equals the contract's `computeCommitment` view, byte-for-byte, against the
deployed address.

---

## C. State machine

A container carries its own status; a manifest carries the lifecycle stage.

```
container:   Sealed ───reveal(match)───▶ Opened
manifest:    Commit ──▶ Reveal ──▶ Judging ──▶ Judged ──▶ Released
```

`phaseOf(manifestId)` derives Commit/Reveal/Judging from the two millisecond
deadlines and reports Judged/Released from stored flags. Because each
`Container` stores a `ContainerStatus` enum (Sealed / Opened), the cargo
registry is **first-class on-chain state**, not something the UI has to infer.

---

## D. Inspection pipeline (batch, not per-item)

```
   opened containers ──┐
                       ├─▶ one prompt ─▶ judgeAll(id, llmInput) ─▶ 0x0802 (TEE)
   rubric ─────────────┘                         │
   sealed/unopened ──▶ excluded                   ▼
                                          report stored as `report` bytes
```

One `judgeAll` builds a single batch request (`messagesJson` with every opened
container numbered `[0..n]` + the rubric) for the LLM precompile at `0x0802`,
model `zai-org/GLM-4.7-FP8`. One call covers the whole batch — never one
inference per container.

Two Ritual-specific operational rules:

1. **Gas is pinned to 6,000,000.** The async replay that decodes the model
   response and writes it to storage uses ~1.09M gas; the auto-estimate covers
   only the first pass and the transaction dies mid-settlement otherwise.
2. **`judgeAll` never reverts on an LLM-side error.** A revert inside the async
   replay would unwind `inspected = true` and wedge the manifest; the report is
   stored only on a clean response, and the human still releases.

---

## E. Trust boundary & human override

`judgeAll` writes bytes; it moves no funds. `finalizeWinner` is a separate,
host-only call that must target an Opened container. The model's recommendation
is advisory: a hallucinated or prompt-injected verdict cannot release the reward
because a human signs the release manifest and is accountable for it.

Escape hatch: if customs closes with zero opened containers, `cancelManifest`
lets the host recover the locked reward instead of it being stranded.

---

## F. Funding the inspection

The LLM precompile charges a prepaid escrow held in the RitualWallet
(`0x532F0dF0…`), which must stay locked long enough to outlive the async
callback. Worst-case escrow ≈ 0.31 RITUAL per batch; the UI deposits ≈ 0.4 with
margin before the host can run `judgeAll`.

---

## G. Advanced track — hidden through judging (design)

Commit-reveal hides cargo *during loading* but opens it at customs, before the
AI inspects. To keep contents hidden *through* inspection:

- the shipper ECIES-encrypts the answer to a live Ritual TEE executor's public
  key instead of hashing it;
- the contract stores only a ciphertext reference + a digest;
- `judgeAll` passes the encrypted containers to the precompile as
  `encryptedSecrets[]`; the TEE decrypts privately, inspects the batch, and
  returns a ranking — plaintext never touching the public chain;
- after inspection, a bundle reference + `keccak256(bundle)` are published so the
  result is auditable without having leaked any contents early.

Plaintext would then exist only on the shipper's device, inside the attested
TEE, and optionally in a post-inspection bundle. Blind Cargo Judge ships the
commit-reveal version (any EVM chain, one hash per shipper, trivially audited)
and leaves this as a clean upgrade.

---

## H. Portability

Off Ritual, the LLM precompile has no code: pass an empty `llmInput` to
`judgeAll` and the lifecycle still completes (used by the Solidity tests). On
Ritual, the batch request is built off-chain and passed in.
