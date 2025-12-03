"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  characterFormSchema,
  type CharacterFieldKey,
} from "@/src/lib/validation/character";
import { generateCharacterInsights } from "@/src/lib/ai/gemini";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getInitialXp } from "@/src/lib/business-logic.config";

type CharacterFieldErrors = Partial<Record<CharacterFieldKey, string>>;

export async function createCharacterAction(
  payload: unknown
): Promise<{ success?: true; error?: string; fieldErrors?: CharacterFieldErrors }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in with Google to continue." };
  }

  const parsed = characterFormSchema.safeParse(payload);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const fieldErrors: CharacterFieldErrors = Object.fromEntries(
      Object.entries(flattened.fieldErrors).flatMap(([key, messages]) => {
        if (!messages?.length) return [];
        return [[key, messages[0]]];
      })
    ) as CharacterFieldErrors;

    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please review your sorcerer details and try again.",
      fieldErrors,
    };
  }

  try {
    const existing = await prisma.character.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      redirect("/dashboard");
    }

    const data = parsed.data;
    
    // Update user with country
    await prisma.user.update({
      where: { id: session.user.id },
      data: { country: data.country },
    });

    const insights = await generateCharacterInsights({
      identity: { name: data.name, gender: data.gender },
      appearance: data.appearance,
      personality: data.personality,
      backstory: data.backstory,
      powerSystem: data.powerSystem,
      cursedTechnique: data.cursedTechnique,
      innateTechnique: data.innateTechnique,
      maximumTechnique: data.maxTechnique,
      domainExpansion: data.domainExpansion,
      reverseTechnique: data.reverseTechnique,
      energyLevel: data.energyLevel,
      powerLevelEstimate: data.powerLevelEstimate,
    });

    await prisma.character.create({
      data: {
        userId: session.user.id,
        name: data.name,
        gender: data.gender,
        appearance: data.appearance,
        personality: data.personality,
        backstory: data.backstory,
        powerSystem: data.powerSystem,
        cursedTechnique: data.cursedTechnique,
        innateTechnique: data.innateTechnique,
        maxTechnique: data.maxTechnique,
        domainExpansion: data.domainExpansion,
        reverseTechnique: data.reverseTechnique,
        energyLevel: data.energyLevel,
        powerLevelEstimate: data.powerLevelEstimate,
        grade: insights.grade,
        weaknesses: insights.weaknesses,
        balancingNotes: insights.balancingNotes ?? [],
        bindingVows: [],
        xp: getInitialXp(), // Give new users initial XP for battles
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Character creation failed", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to finalize sorcerer profile. Try again shortly.",
    };
  }
}


