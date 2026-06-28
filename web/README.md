# Blind Cargo Judge

**Sealed Submission Freight System — a privacy-preserving AI bounty judge for Ritual L1.**

Bounty answers move through a secure freight terminal. During submission an
answer is packed into a **sealed cargo container** — only its **barcode hash**
ships on-chain. After the loading cutoff, containers pass **customs** (reveal):
the barcode is rescanned and only matching containers open. Every verified
container then goes through **one batch inspection** by the Ritual AI, which
recommends a winner — and a **human owner signs the release manifest** to pay.

> private answer → sealed container → barcode hash → customs reveal → batch
> inspection → AI recommendation → human release → reward paid
>
> **AI recommends. Owner releases.**

This is a frontend build (mock/demo logic), structured for real Ritual contract
integration later.

## Tech stack

- **React + Vite + TypeScript** — foundation
- **Tailwind CSS v4** — the industrial cargo-terminal design system
- **Radix UI** — accessible dialogs/drawers, heavily restyled
- **Motion (Framer Motion)** — stage transitions and micro-interactions
- **GSAP** — available for the heavier mechanical/conveyor sequences
- **Zustand** — app state (phase, role, bounty, submissions, verdict, demo)
- **viem** — commit-reveal hashing; service abstraction ready for Web3
- **lucide-react** — icons

## The 10 checkpoints

| # | Checkpoint | What happens |
|---|-----------|--------------|
| 0 | Wallet Dock | connect wallet; the dock gate opens |
| 1 | Bounty Manifest | owner creates the manifest, locks the reward |
| 2 | Phase Control | phase board + mechanical countdowns |
| 3 | Seal Cargo | pack the answer; only the barcode hash ships |
| 4 | Customs Reveal | scan two barcodes; match opens the container |
| 5 | Fuel Inspection | owner loads inference fuel into the AI machine |
| 6 | Batch Inspection | all verified cargo inspected together in one tunnel |
| 7 | AI Report | the recommendation prints |
| 8 | Release Winner | owner signs the manifest; the vault pays |
| 9 | Cargo Registry | every container, by state |

## Unique skeleton

```
┌──────────────────── Top Terminal Bar ────────────────────┐
│ Cargo Route │      Cargo Bay        │  Manifest Stack      │
│ (left rail) │   (active checkpoint) │  (right panels)      │
│  10 plates  │                       │                      │
├──────────────────── Conveyor Event Log ──────────────────┤
└───────────────────────────────────────────────────────────┘
        + Cargo Registry drawer (opens from the bottom)
```

A left vertical cargo route (10 checkpoint plates, the active one slides out and
lights Safety Yellow), a center cargo bay that changes machinery per stage, a
right stack of layered shipping manifests, and a bottom conveyor belt where
events ride past as little crates.

## Color system

Carbon Steel / Iron / Concrete / Paper base, with **Safety Yellow** (active),
**Signal Teal** (verified reveals), **Burnt Orange** (owner), **Electric Blue**
(Ritual AI), **Bullion Gold** (reward/winner), **Alarm Red** (errors), and
**Sealed Grey** (hidden cargo).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Demo mode

Toggle **Demo** in the top bar to load a sample freight job
(*"Best Ritual Private Judge Design"*, 5 RITUAL, 4 participants, 4 sealed
commitments, 3 valid reveals, 1 unrevealed). The demo controls let you advance
the deadline, step checkpoints, run batch inspection, release the winner, and
reset.

## Web3-ready architecture

- `src/services/mockBountyService.ts` — drives demo mode.
- `src/services/web3BountyService.ts` — same interface, with `TODO`s where the
  viem/wagmi calls against a deployed contract go.

Ritual specifics noted in the scaffold:
- `block.timestamp` is in **milliseconds** — deadlines stay in ms.
- `judgeAll` must **pin `gas: 6_000_000`** (async LLM replay ~1.09M gas).
- AI escrow ≈ 0.31 RITUAL per batch; the UI deposits ≈ 0.4.
- Commitment = `keccak256(abi.encode(answer, salt, sender, bountyId))`.

## Project structure

```
src/
  components/
    layout/    TopBar, CargoRouteRail, CargoBayStage, ManifestStackPanel,
               ConveyorEventLog, CargoRegistryDrawer, DemoControls
    stages/    one scene per checkpoint (0–9)
    cargo/     containers, barcode, countdown, AI machine, reward vault
    modals/    SafetyConfirmDialog, HelpModal
    feedback/  Toaster
    ui/        Button, Field, Badge (restyled Radix)
  store/       useCargoStore (Zustand)
  services/    mock + web3-ready
  lib/         crypto · stages · revealKit · utils
  types/
  styles/      globals.css (design system)
```
