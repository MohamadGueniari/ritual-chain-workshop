import type { AIVerdict, Bounty, Submission, SubmissionStatus } from "@/types";
import type { BountyService, CreateBountyInput } from "./types";
import type { Address, Hex } from "viem";
import { parseEther } from "viem";
import { publicClient, getWalletClient, requestAccounts, getChainId, ensureRitualNetwork } from "@/lib/viemClient";
import { manifestAbi, contractAddress, executorAddress } from "@/config/contract";
import { buildJudgeAllLlmInput, type JudgeSubmission } from "@/lib/ritualLlm";
import { decodeAiReport } from "@/lib/aiReport";

/* ============================================================================
   Ritual L1 bounty service — talks to the deployed CargoManifestJudge.

   Ritual specifics honored:
     • block.timestamp is in MILLISECONDS — deadlines sent/read in ms.
     • judgeAll triggers an async LLM replay (~1.09M gas); PIN gas: 6_000_000n.
     • Commitment = keccak256(abi.encode(answer, salt, sender, manifestId)).
   ========================================================================== */

const RITUAL = "RITUAL";

async function activeAccount(): Promise<Address> {
  const [addr] = await requestAccounts();
  if (!addr) throw new Error("No account connected.");
  return addr;
}

type BountyTuple = readonly [
  Address, string, string, bigint, bigint, bigint,
  boolean, boolean, bigint, bigint, bigint, Hex,
];

function toBounty(id: bigint, raw: BountyTuple): Bounty {
  const [owner, title, rubric, reward, submissionDeadline, revealDeadline, judged, finalized] = raw;
  const now = Date.now();
  let phase: Bounty["phase"];
  if (finalized) phase = "finalized";
  else if (judged) phase = "judged";
  else if (now < Number(submissionDeadline)) phase = "commit";
  else if (now < Number(revealDeadline)) phase = "reveal";
  else phase = "judging";

  return {
    id,
    title,
    rubric,
    owner,
    reward: Number(reward) / 1e18,
    rewardSymbol: RITUAL,
    submissionDeadline: Number(submissionDeadline),
    revealDeadline: Number(revealDeadline),
    phase,
    aiFunded: judged,
    aiFundBalance: 0,
    aiFundRequired: 0.4,
  };
}

async function readBounty(id: bigint): Promise<BountyTuple> {
  return publicClient.readContract({
    address: contractAddress,
    abi: manifestAbi,
    functionName: "getBounty",
    args: [id],
  }) as Promise<BountyTuple>;
}

function statusFor(opened: boolean, finalized: boolean, isWinner: boolean): SubmissionStatus {
  if (isWinner) return "winner";
  if (opened) return "opened";
  return finalized ? "unrevealed" : "sealed";
}

export const web3BountyService: BountyService = {
  async connectWallet() {
    await ensureRitualNetwork();
    const address = await activeAccount();
    const chainId = await getChainId();
    return { address, chainId };
  },

  async createBounty(input: CreateBountyInput): Promise<Bounty> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: manifestAbi,
      functionName: "createBounty",
      args: [input.title, input.rubric, BigInt(Math.floor(input.submissionDeadline)), BigInt(Math.floor(input.revealDeadline))],
      value: parseEther(String(input.reward)),
    });
    await publicClient.waitForTransactionReceipt({ hash });
    const next = (await publicClient.readContract({
      address: contractAddress,
      abi: manifestAbi,
      functionName: "nextManifestId",
    })) as bigint;
    const id = next - 1n;
    return toBounty(id, await readBounty(id));
  },

  async getBounty(id: bigint): Promise<Bounty | null> {
    try {
      return toBounty(id, await readBounty(id));
    } catch {
      return null;
    }
  },

  async getSubmissions(id: bigint): Promise<Submission[]> {
    const raw = await readBounty(id);
    const count = Number(raw[8]);
    const finalized = raw[7];
    const winnerIndex = Number(raw[10]);
    const subs: Submission[] = [];
    for (let i = 0; i < count; i++) {
      const [shipper, barcode, opened, contents] = (await publicClient.readContract({
        address: contractAddress,
        abi: manifestAbi,
        functionName: "getSubmission",
        args: [id, BigInt(i)],
      })) as readonly [Address, Hex, boolean, string];
      const isWinner = finalized && winnerIndex === i;
      subs.push({
        index: i,
        participant: shipper,
        commitment: barcode,
        status: statusFor(opened, finalized, isWinner),
        revealedAnswer: opened ? contents : undefined,
        eligible: opened,
      });
    }
    return subs;
  },

  async submitCommitment(id: bigint, commitment: Hex): Promise<Submission> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: manifestAbi,
      functionName: "submitCommitment",
      args: [id, commitment],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return { index: -1, participant: account, commitment, status: "sealed", eligible: false };
  },

  async revealAnswer(id: bigint, answer: string, salt: Hex): Promise<Submission> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: manifestAbi,
      functionName: "revealAnswer",
      args: [id, answer, salt],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return { index: -1, participant: account, commitment: "0x" as Hex, status: "opened", revealedAnswer: answer, eligible: true };
  },

  async fundAI(id: bigint, _amount: number): Promise<Bounty> {
    // Funding is the RitualWallet escrow concern, handled by the fuel panel.
    void _amount;
    return toBounty(id, await readBounty(id));
  },

  async judgeAll(id: bigint): Promise<AIVerdict> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const raw = await readBounty(id);
    const [, title, rubric] = raw;
    const count = Number(raw[8]);

    const submissions: JudgeSubmission[] = [];
    for (let i = 0; i < count; i++) {
      const [submitter, , opened, contents] = (await publicClient.readContract({
        address: contractAddress,
        abi: manifestAbi,
        functionName: "getSubmission",
        args: [id, BigInt(i)],
      })) as readonly [Address, Hex, boolean, string];
      if (opened) submissions.push({ index: i, submitter, answer: contents });
    }

    const llmInput = buildJudgeAllLlmInput({ executorAddress, title, rubric, submissions });

    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: manifestAbi,
      functionName: "judgeAll",
      args: [id, llmInput],
      // CRITICAL: pin gas — the async LLM replay needs ~1.09M; auto-estimate dies.
      gas: 6_000_000n,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const after = await readBounty(id);
    const decoded = decodeAiReport(after[11]);
    const fallback = submissions[0]?.index ?? 0;

    if (!decoded) {
      return {
        recommendedIndex: fallback,
        summary: "The inspection transaction settled, but no structured report was returned. Review the opened containers and release a winner.",
        confidence: "low",
        ranking: submissions.map((s) => ({ index: s.index, score: 0, reason: "" })),
      };
    }
    return {
      recommendedIndex: decoded.winnerIndex ?? fallback,
      summary: decoded.summary || "The AI inspected every opened container together in one batch.",
      confidence: "high",
      ranking:
        decoded.ranking.length > 0
          ? decoded.ranking
          : submissions.map((s) => ({
              index: s.index,
              score: s.index === decoded.winnerIndex ? 100 : 0,
              reason: s.index === decoded.winnerIndex ? "Recommended by the Ritual AI." : "",
            })),
    };
  },

  async finalizeWinner(id: bigint, winnerIndex: number): Promise<Bounty> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: manifestAbi,
      functionName: "finalizeWinner",
      args: [id, BigInt(winnerIndex)],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return toBounty(id, await readBounty(id));
  },
};
