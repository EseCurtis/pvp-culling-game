import { Character, FightResult, Prisma } from "@prisma/client";
import {
  BattleSummarySchema,
  CharacterInsights,
  WeaknessesSchema
} from "./ai/gemini";
import { prisma } from "./prisma";

export type CharacterWithRelations = Character & {
  fightsAsWinner: FightResult[];
  fightsAsLoser: FightResult[];
};

export type BindingVow = {
  name: string;
  sacrifice: string;
  enhancements: string[];
  conditions: string[];
  limitations: string[];
  sideEffects: string[];
};

export function parseWeaknesses(
  character: Character
): CharacterInsights["weaknesses"] {
  if (!character.weaknesses) {
    throw new Error("Character is missing weaknesses payload");
  }

  return WeaknessesSchema.parse(character.weaknesses);
}

export function parseBindingVows(character: Character): BindingVow[] {
  if (!character.bindingVows) {
    return [];
  }

  const vows = character.bindingVows as unknown;
  if (!Array.isArray(vows)) {
    return [];
  }

  return vows as BindingVow[];
}

export function parseBattleSummary(payload: Prisma.JsonValue) {
  return BattleSummarySchema.parse(payload);
}

export async function getUserCharacter(userId: string) {
  return prisma.character.findUnique({
    where: { userId },
    include: {
      fightsAsWinner: {
        orderBy: { occurredAt: "desc" },
        take: 10,
        include: {
          loser: { select: { id: true, name: true } },
        },
      },
      fightsAsLoser: {
        orderBy: { occurredAt: "desc" },
        take: 10,
        include: {
          winner: { select: { id: true, name: true } },
        },
      },
    },
  });
}

