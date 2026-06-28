import { create } from "zustand";
import type {
  AIVerdict,
  Bounty,
  NetworkStatus,
  StageId,
  Submission,
  TimelineEvent,
  TimelineEventKind,
  UserRole,
} from "@/types";
import { web3BountyService as bountyService } from "@/services/web3BountyService";
import { STAGES, livePhase, autoStageFor } from "@/lib/stages";

const RITUAL_CHAIN_ID = 1979;

interface CargoState {
  network: NetworkStatus;
  address: `0x${string}` | null;
  chainId: number | null;
  role: UserRole;

  activeStage: StageId;
  furthestStage: number;

  bounty: Bounty | null;
  submissions: Submission[];
  verdict: AIVerdict | null;
  selectedWinner: number | null;

  busy: boolean;
  error: string | null;
  timeline: TimelineEvent[];
  lastPhase: Bounty["phase"] | null;
  autoFollow: boolean;

  setStage: (id: StageId) => void;
  unlockUpTo: (index: number) => void;
  pushEvent: (kind: TimelineEventKind, label: string, detail?: string) => void;
  setAutoFollow: (v: boolean) => void;

  connect: () => Promise<void>;
  disconnect: () => void;
  setRole: (role: UserRole) => void;

  createBounty: (input: {
    title: string;
    rubric: string;
    reward: number;
    submissionDeadline: number;
    revealDeadline: number;
  }) => Promise<void>;
  refreshBounty: () => Promise<void>;
  loadBounty: (id: bigint) => Promise<void>;
  submitCommitment: (commitment: `0x${string}`) => Promise<void>;
  revealAnswer: (answer: string, salt: `0x${string}`) => Promise<void>;
  fundAI: (amount: number) => Promise<void>;
  judgeAll: () => Promise<void>;
  selectWinner: (index: number) => void;
  finalizeWinner: (index: number) => Promise<void>;

  tick: () => void;
}

const stageIndex = (id: StageId) => STAGES.findIndex((s) => s.id === id);

function roleFor(address: string | null, bounty: Bounty | null): UserRole {
  if (!address) return "visitor";
  if (!bounty) return "participant";
  return bounty.owner.toLowerCase() === address.toLowerCase() ? "owner" : "participant";
}

export const useCargoStore = create<CargoState>((set, get) => ({
  network: "disconnected",
  address: null,
  chainId: null,
  role: "visitor",

  activeStage: "dock",
  furthestStage: 0,

  bounty: null,
  submissions: [],
  verdict: null,
  selectedWinner: null,

  busy: false,
  error: null,
  timeline: [],
  lastPhase: null,
  autoFollow: true,

  setStage: (id) => set({ activeStage: id }),
  unlockUpTo: (index) => set((s) => ({ furthestStage: Math.max(s.furthestStage, index) })),
  setAutoFollow: (v) => set({ autoFollow: v }),

  pushEvent: (kind, label, detail) =>
    set((s) => ({
      timeline: [
        ...s.timeline,
        { id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind, label, detail, at: Date.now() },
      ],
    })),

  connect: async () => {
    set({ busy: true, error: null });
    try {
      const { address, chainId } = await bountyService.connectWallet();
      const network: NetworkStatus = chainId === RITUAL_CHAIN_ID ? "connected" : "wrong-network";
      set({ address, chainId, network, role: roleFor(address, get().bounty) });
      get().unlockUpTo(stageIndex("manifest"));
      get().setStage("manifest");
      get().pushEvent("wallet", "Wallet docked", address);
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  disconnect: () =>
    set({ network: "disconnected", address: null, chainId: null, role: "visitor", activeStage: "dock" }),

  setRole: (role) => set({ role }),

  createBounty: async (input) => {
    set({ busy: true, error: null });
    try {
      const bounty = await bountyService.createBounty(input);
      set({ bounty, submissions: [], role: roleFor(get().address, bounty) });
      get().pushEvent("created", "Bounty created", bounty.title);
      get().pushEvent("reward-locked", "Reward locked", `${bounty.reward} ${bounty.rewardSymbol}`);
      get().unlockUpTo(stageIndex("registry"));
      get().setStage("phase");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  refreshBounty: async () => {
    const { bounty } = get();
    if (!bounty) return;
    const [b, subs] = await Promise.all([
      bountyService.getBounty(bounty.id),
      bountyService.getSubmissions(bounty.id),
    ]);
    set({ bounty: b ?? bounty, submissions: subs, role: roleFor(get().address, b ?? bounty) });
  },

  loadBounty: async (id) => {
    set({ busy: true, error: null });
    try {
      const b = await bountyService.getBounty(id);
      if (!b) {
        set({ error: `Manifest #${id.toString()} not found.` });
        return;
      }
      const subs = await bountyService.getSubmissions(id);
      set({ bounty: b, submissions: subs, role: roleFor(get().address, b), verdict: null, selectedWinner: null });
      get().unlockUpTo(stageIndex("registry"));
      get().setStage("phase");
      get().pushEvent("created", "Manifest loaded", b.title);
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  submitCommitment: async (commitment) => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    try {
      await bountyService.submitCommitment(bounty.id, commitment);
      await get().refreshBounty();
      get().pushEvent("sealed", "Cargo sealed");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  revealAnswer: async (answer, salt) => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    try {
      await bountyService.revealAnswer(bounty.id, answer, salt);
      await get().refreshBounty();
      get().pushEvent("revealed", "Cargo revealed");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  fundAI: async (amount) => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    try {
      const b = await bountyService.fundAI(bounty.id, amount);
      set({ bounty: b });
      get().pushEvent("fund", "AI inspection funded");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  judgeAll: async () => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    get().pushEvent("inspect-start", "Batch inspection started");
    try {
      const verdict = await bountyService.judgeAll(bounty.id);
      await get().refreshBounty();
      set({ verdict, selectedWinner: verdict.recommendedIndex });
      get().pushEvent("report", "AI report received", `recommends container #${verdict.recommendedIndex}`);
      get().setStage("report");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  selectWinner: (index) => set({ selectedWinner: index }),

  finalizeWinner: async (index) => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    try {
      const b = await bountyService.finalizeWinner(bounty.id, index);
      await get().refreshBounty();
      set({ bounty: b });
      get().pushEvent("released", "Winner released", `container #${index}`);
      get().pushEvent("paid", "Reward paid", `${b.reward} ${b.rewardSymbol}`);
      get().setStage("registry");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  tick: () => {
    const { bounty, lastPhase, autoFollow, busy, activeStage } = get();
    if (!bounty) return;
    const phase = livePhase(bounty, Date.now());
    if (phase !== lastPhase) {
      set({ lastPhase: phase });
      if (lastPhase !== null && !busy) void get().refreshBounty();
      if (lastPhase !== null && autoFollow && !busy) {
        const target = autoStageFor(bounty, get().role);
        const stay = activeStage === "phase" || activeStage === "registry";
        if (target && target !== activeStage && !stay) {
          const idx = stageIndex(target);
          if (idx >= 0) get().unlockUpTo(idx);
          get().setStage(target);
          get().pushEvent("sealed", "Phase advanced", `now in ${phase}`);
        }
      }
    }
  },
}));
