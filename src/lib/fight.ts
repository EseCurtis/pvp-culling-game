import { Character } from "@prisma/client";
import {
  generateBattleSummary,
  type BattleSummaryContext,
  type FighterStats,
} from "./ai/gemini";
import { businessLogicConfig } from "./business-logic.config";
import { parseBindingVows, parseWeaknesses } from "./character";
import { prisma } from "./prisma";
import { sendLeaderboardMovementEmail } from "./mailer";

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
    // In JJK, winning battles increases cursed energy through experience
    const challengerUpdateData: {
      xp: { increment: number };
      energyLevel?: { increment: number };
      wins?: { increment: number };
      losses?: { increment: number };
      lastFoughtAt: Date;
    } = {
      xp: { increment: challengerXpChange },
      lastFoughtAt: fightRecord.occurredAt,
    };

    if (challengerWon) {
      challengerUpdateData.wins = { increment: 1 };
      // Winning battles increases cursed energy through combat experience
      challengerUpdateData.energyLevel = { increment: 10 };
    } else {
      challengerUpdateData.losses = { increment: 1 };
      // Even losing provides some growth, but less
      challengerUpdateData.energyLevel = { increment: 5 };
    }

    const updatedChallenger = await tx.character.update({
      where: { id: challenger.id },
      data: challengerUpdateData,
    });

    // Update defender stats and XP
    // In JJK, winning battles increases cursed energy through experience
    const defenderUpdateData: {
      xp: { increment: number };
      energyLevel?: { increment: number };
      wins?: { increment: number };
      losses?: { increment: number };
      lastFoughtAt: Date;
    } = {
      xp: { increment: defenderXpChange },
      lastFoughtAt: fightRecord.occurredAt,
    };

    if (challengerWon) {
      defenderUpdateData.losses = { increment: 1 };
      // Even losing provides some growth, but less
      defenderUpdateData.energyLevel = { increment: 5 };
    } else {
      defenderUpdateData.wins = { increment: 1 };
      // Winning battles increases cursed energy through combat experience
      defenderUpdateData.energyLevel = { increment: 10 };
    }

    const updatedDefender = await tx.character.update({
      where: { id: defender.id },
      data: defenderUpdateData,
    });

    // Validate XP doesn't go negative (shouldn't happen due to pre-check, but safety measure)
    if (updatedChallenger.xp < 0 || updatedDefender.xp < 0) {
      throw new Error("XP balance cannot be negative");
    }

    // Cap energy level at 9999 (JJK lore limit)
    if (updatedChallenger.energyLevel > 9999 || updatedDefender.energyLevel > 9999) {
      await Promise.all([
        updatedChallenger.energyLevel > 9999
          ? tx.character.update({
              where: { id: challenger.id },
              data: { energyLevel: 9999 },
            })
          : Promise.resolve(),
        updatedDefender.energyLevel > 9999
          ? tx.character.update({
              where: { id: defender.id },
              data: { energyLevel: 9999 },
            })
          : Promise.resolve(),
      ]);
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
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  const updates: {
    id: string;
    oldRank: number;
    newRank: number;
    email?: string | null;
    characterName: string;
  }[] = [];

  ranked.forEach((character, index) => {
    const newRank = index + 1;
    const oldRank = character.ranking;

    if (oldRank === newRank) {
      return;
    }

    updates.push({
      id: character.id,
      oldRank,
      newRank,
      email: character.user?.email ?? null,
      characterName: character.name,
    });
  });

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.character.update({
          where: { id: update.id },
          data: {
            ranking: update.newRank,
            previousRanking: update.oldRank,
          },
        })
      )
    );
  }

  // Send notifications for users whose rank worsened (their spot was taken)
  if (process.env.ENABLE_LEADERBOARD_EMAILS === "true") {
    const movements = updates.filter(
      (u) => u.email && u.oldRank > 0 && u.newRank > u.oldRank
    );

    if (movements.length > 0) {
      await Promise.all(
        movements.map((movement) =>
          sendLeaderboardMovementEmail({
            email: movement.email!,
            characterName: movement.characterName,
            oldRank: movement.oldRank,
            newRank: movement.newRank,
          }).catch((error) => {
            console.error("Failed to send leaderboard email", error);
          })
        )
      );
    }
  }
}


