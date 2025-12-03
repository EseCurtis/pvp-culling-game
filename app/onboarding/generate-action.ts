"use server";

import { generateCharacterFromPrompt } from "@/src/lib/ai/gemini";
import { createCharacterFromGenerated } from "./actions";

export async function generateAndCreateCharacterAction(
  prompt: string
): Promise<{ success?: true; error?: string }> {
  try {
    // Generate character from prompt
    const generated = await generateCharacterFromPrompt(prompt);

    // Create character with generated data
    const result = await createCharacterFromGenerated({
      ...generated,
      country: "", // Optional, can be set later
    });

    return result;
  } catch (error) {
    console.error("Character generation failed", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate character. Please try again.",
    };
  }
}

