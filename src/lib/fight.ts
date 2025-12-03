import { Character } from "@prisma/client";
import {
    generateBattleSummary,
    type BattleSummaryContext,
    type FighterStats,
} from "./ai/gemini";
import { businessLogicConfig } from "./business-logic.config";
import { parseBindingVows, parseWeaknesses } from "./character";
import { prisma } from "./prisma";

function safeWeaknesses(character: Character) {
  try {
    return parseWeaknesses(character);
  } catch {
    return {
      cursedTechniqueDrawbacks: ["Unknown drawback"],
      physicalLimitations: ["Stamina drain"],
      personalityFlaws: ["Overconfidence"],
      battleVulnerabilities: ["Predictable follow-up attacks"],
    };
  }
}

function buildFighterStats(character: Character): FighterStats {
  const weaknesses = safeWeaknesses(character);
  const bindingVows = parseBindingVows(character);

  return {
    name: character.name,
    grade: character.grade,
    energyLevel: character.energyLevel,
    cursedTechnique: character.cursedTechnique,
    innateTechnique: character.innateTechnique,
    maxTechnique: character.maxTechnique,
    domainExpansion: character.domainExpansion,
    reverseTechnique: character.reverseTechnique ?? null,
    weaknesses,
    bindingVows: bindingVows.map((vow) => ({
      name: vow.name,
      sacrifice: vow.sacrifice,
      enhancements: vow.enhancements,
      conditions: vow.conditions,
      limitations: vow.limitations,
      sideEffects: vow.sideEffects,
    })),
    wins: character.wins,
    losses: character.losses,
    ranking: character.ranking,
  };
}

export async function executeFight(
  challengerId: string,
  defenderId: string
) {
  const battleCost = businessLogicConfig.xp.battleCost;
  const winReward = businessLogicConfig.xp.winReward;

  // Fetch both fighters with their current stats
  const [challenger, defender] = await Promise.all([
    prisma.character.findUnique({ where: { id: challengerId } }),
    prisma.character.findUnique({ where: { id: defenderId } }),
  ]);

  if (!challenger || !defender) {
    throw new Error("One or both fighters not found");
  }

  if (challenger.id === defender.id) {
    throw new Error("Cannot fight yourself");
  }

  // Check if challenger has enough XP to initiate the battle
  if (challenger.xp < battleCost) {
    throw new Error(
      `Insufficient XP. You need ${battleCost} XP to challenge, but you only have ${challenger.xp} XP.`
    );
  }

  // Build complete fighter stats for AI analysis
  const challengerStats = buildFighterStats(challenger);
  const defenderStats = buildFighterStats(defender);

  // Let AI determine the winner based on all stats
  // fighterA = challenger, fighterB = defender (the one being challenged)
  const summaryContext: BattleSummaryContext = {
    fighterA: challengerStats,
    fighterB: defenderStats,
  };

  const summary = await generateBattleSummary(summaryContext);

  // Determine winner based on AI's decision
  const winner = summary.winner === "fighterA" ? challenger : defender;
  const loser = summary.winner === "fighterA" ? defender : challenger;
  const challengerWon = winner.id === challenger.id;

  // Execute all database updates atomically in a transaction
  // This ensures XP transfers, stats updates, and fight record creation are all-or-nothing
  const fight = await prisma.$transaction(async (tx) => {
    // Create fight record
    const fightRecord = await tx.fightResult.create({
      data: {
        character1Id: challenger.id,
        character2Id: defender.id,
        winnerId: winner.id,
        loserId: loser.id,
        summaryTitle: summary.title,
        summaryNarrative: summary.narrative,
        summaryPayload: summary,
        round: 1, // All 1v1 fights are round 1
      },
    });

    // XP Transfer Logic (atomic):
    // 1. Challenger pays battleCost XP (transferred to defender)
    // 2. Defender receives battleCost XP
    // 3. Winner receives winReward XP bonus

    // Calculate XP changes for each character
    const challengerXpChange = challengerWon
      ? -battleCost + winReward // Challenger wins: pays cost, gets reward
      : -battleCost; // Challenger loses: only pays cost

    const defenderXpChange = challengerWon
      ? battleCost // Defender loses: receives challenger's payment
      : battleCost + winReward; // Defender wins: receives payment + reward

    // Update challenger stats and XP
    const challengerUpdateData: {
      xp: { increment: number };
      wins?: { increment: number };
      losses?: { increment: number };
      lastFoughtAt: Date;
    } = {
      xp: { increment: challengerXpChange },
      lastFoughtAt: fightRecord.occurredAt,
    };

    if (challengerWon) {
      challengerUpdateData.wins = { increment: 1 };
    } else {
      challengerUpdateData.losses = { increment: 1 };
    }

    const updatedChallenger = await tx.character.update({
      where: { id: challenger.id },
      data: challengerUpdateData,
    });

    // Update defender stats and XP
    const defenderUpdateData: {
      xp: { increment: number };
      wins?: { increment: number };
      losses?: { increment: number };
      lastFoughtAt: Date;
    } = {
      xp: { increment: defenderXpChange },
      lastFoughtAt: fightRecord.occurredAt,
    };

    if (challengerWon) {
      defenderUpdateData.losses = { increment: 1 };
    } else {
      defenderUpdateData.wins = { increment: 1 };
    }

    const updatedDefender = await tx.character.update({
      where: { id: defender.id },
      data: defenderUpdateData,
    });

    // Validate XP doesn't go negative (shouldn't happen due to pre-check, but safety measure)
    if (updatedChallenger.xp < 0 || updatedDefender.xp < 0) {
      throw new Error("XP balance cannot be negative");
    }

    return fightRecord;
  });

  // Recompute rankings (outside transaction to avoid long locks)
  await recomputeRankings();

  return fight;
}

async function recomputeRankings() {
  const ranked = await prisma.character.findMany({
    orderBy: [
      { wins: "desc" },
      { losses: "asc" },
      { energyLevel: "desc" },
      { createdAt: "asc" },
    ],
  });

  await prisma.$transaction(
    ranked.map((character, index) =>
      prisma.character.update({
        where: { id: character.id },
        data: { ranking: index + 1 },
      })
    )
  );
}

