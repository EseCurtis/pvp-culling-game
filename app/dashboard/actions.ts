"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
  bindingVowConceptSchema,
  characterUpgradeSchema,
} from "@/src/lib/validation/character";
import {
  generateBindingVowDetails,
  generateCharacterInsights,
  type CharacterProfileInput,
} from "@/src/lib/ai/gemini";
import { parseBindingVows } from "@/src/lib/character";

function buildProfileInput(
  character: Awaited<ReturnType<typeof prisma.character.findUnique>>,
  overrides: Partial<CharacterProfileInput>
): CharacterProfileInput {
  if (!character) {
    throw new Error("Character is required to build profile.");
  }

  const vows = parseBindingVows(character).map(
    ({ name, sacrifice, enhancements, conditions, limitations }) => ({
      name,
      sacrifice,
      effect: enhancements.join(", "),
      limitations: [...conditions, ...limitations],
    })
  );

  return {
    identity: {
      name: overrides.identity?.name ?? character.name,
      gender: overrides.identity?.gender ?? character.gender,
    },
    appearance: overrides.appearance ?? character.appearance,
    personality: overrides.personality ?? character.personality,
    backstory: overrides.backstory ?? character.backstory,
    powerSystem: overrides.powerSystem ?? character.powerSystem,
    cursedTechnique:
      overrides.cursedTechnique ?? character.cursedTechnique ?? "",
    innateTechnique:
      overrides.innateTechnique ?? character.innateTechnique ?? "",
    maximumTechnique: overrides.maximumTechnique ?? character.maxTechnique,
    domainExpansion:
      overrides.domainExpansion ?? character.domainExpansion ?? "",
    reverseTechnique:
      overrides.reverseTechnique ?? character.reverseTechnique ?? undefined,
    energyLevel: overrides.energyLevel ?? character.energyLevel,
    powerLevelEstimate:
      overrides.powerLevelEstimate ?? character.powerLevelEstimate,
    bindingVows: overrides.bindingVows ?? vows,
  };
}

export async function updateCharacterAction(
  payload: unknown
): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to evolve your fighter." };
  }

  const parsed = characterUpgradeSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Review your upgrades and try again.",
    };
  }

  const candidate = parsed.data;
  const character = await prisma.character.findUnique({
    where: { userId: session.user.id },
  });

  if (!character) {
    return { error: "Create a sorcerer first." };
  }

  const downgradeField = (
    [
      "appearance",
      "personality",
      "backstory",
      "powerSystem",
      "cursedTechnique",
      "innateTechnique",
      "maxTechnique",
      "domainExpansion",
      "reverseTechnique",
    ] as const
  ).find((field) => {
    const value = candidate[field];
    if (!value) return false;
    const current = character[field === "maxTechnique" ? "maxTechnique" : field];
    if (!current) return false;
    return value.length < current.length;
  });

  if (downgradeField) {
    return {
      error: "Lore depth cannot shrink. Add more detail, never less.",
    };
  }

  // Calculate energy level increase based on upgrades
  // In JJK, energy increases through mastery and achievements, not arbitrary numbers
  let energyLevelIncrease = 0;
  
  // Technique mastery increases energy
  if (candidate.domainExpansion) {
    energyLevelIncrease += 50; // Domain mastery is a major power boost
  }
  if (candidate.reverseTechnique) {
    energyLevelIncrease += 30; // Reverse cursed technique mastery
  }
  if (candidate.maxTechnique) {
    energyLevelIncrease += 40; // Maximum technique evolution
  }
  if (candidate.cursedTechnique || candidate.innateTechnique) {
    energyLevelIncrease += 20; // Technique refinement
  }
  
  // Power system refinement
  if (candidate.powerSystem) {
    energyLevelIncrease += 15;
  }
  
  // Character growth (backstory, personality evolution)
  if (candidate.backstory || candidate.personality) {
    energyLevelIncrease += 10;
  }

  const newEnergyLevel = Math.min(9999, character.energyLevel + energyLevelIncrease);

  const profileInput = buildProfileInput(character, {
    appearance: candidate.appearance,
    personality: candidate.personality,
    backstory: candidate.backstory,
    powerSystem: candidate.powerSystem,
    cursedTechnique: candidate.cursedTechnique,
    innateTechnique: candidate.innateTechnique,
    maximumTechnique: candidate.maxTechnique,
    domainExpansion: candidate.domainExpansion,
    reverseTechnique: candidate.reverseTechnique,
    energyLevel: newEnergyLevel,
    powerLevelEstimate: candidate.powerLevelEstimate,
  });

  const insights = await generateCharacterInsights(profileInput);

  await prisma.character.update({
    where: { id: character.id },
    data: {
      ...candidate,
      energyLevel: newEnergyLevel, // Update with calculated energy level
      grade: insights.grade,
      weaknesses: insights.weaknesses,
      balancingNotes: insights.balancingNotes ?? character.balancingNotes ?? [],
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function createBindingVowAction(
  payload: unknown
): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to craft binding vows." };
  }

  const parsed = bindingVowConceptSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Binding vow concept is incomplete.",
    };
  }

  const concept = parsed.data;
  const character = await prisma.character.findUnique({
    where: { userId: session.user.id },
  });

  if (!character) {
    return { error: "Create a sorcerer first." };
  }

  const aiVow = await generateBindingVowDetails(concept.concept);
  const existingVows = parseBindingVows(character);

  const updatedVows = [
    ...existingVows,
    {
      name: concept.name,
      sacrifice: aiVow.sacrifice,
      enhancements: aiVow.enhancements,
      conditions: aiVow.conditions,
      limitations: aiVow.limitations,
      sideEffects: aiVow.sideEffects,
    },
  ];

  const profileInput = buildProfileInput(character, {
    bindingVows: updatedVows.map(
      ({ name, sacrifice, enhancements, conditions, limitations }) => ({
        name,
        sacrifice,
        effect: enhancements.join(", "),
        limitations: [...conditions, ...limitations],
      })
    ),
  });

  const insights = await generateCharacterInsights(profileInput);

  // Binding vows increase cursed energy through sacrifice and power exchange
  // Each binding vow provides a significant energy boost (lore-accurate)
  const energyLevelIncrease = 25; // Binding vows are major power boosts in JJK
  const newEnergyLevel = Math.min(9999, character.energyLevel + energyLevelIncrease);

  await prisma.character.update({
    where: { id: character.id },
    data: {
      bindingVows: updatedVows,
      energyLevel: newEnergyLevel,
      grade: insights.grade,
      weaknesses: insights.weaknesses,
      balancingNotes: insights.balancingNotes ?? character.balancingNotes ?? [],
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { success: true };
}


