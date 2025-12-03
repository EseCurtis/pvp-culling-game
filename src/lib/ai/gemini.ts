import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const GEMINI_MODEL = "gemini-2.0-flash-exp";
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn(
    "GEMINI_API_KEY is missing. AI powered features will fail until it is provided."
  );
}

const client = geminiApiKey
  ? new GoogleGenerativeAI(geminiApiKey)
  : null;

export type CharacterProfileInput = {
  identity: {
    name: string;
    gender: string;
  };
  appearance: string;
  personality: string;
  backstory: string;
  powerSystem: string;
  cursedTechnique: string;
  innateTechnique: string;
  maximumTechnique: string;
  domainExpansion: string;
  reverseTechnique?: string | null;
  energyLevel: number;
  powerLevelEstimate: string;
  bindingVows?: Array<{
    name: string;
    sacrifice: string;
    effect: string;
    limitations: string[];
  }>;
};

export const WeaknessesSchema = z.object({
  cursedTechniqueDrawbacks: z.array(z.string()).min(1),
  physicalLimitations: z.array(z.string()).min(1),
  personalityFlaws: z.array(z.string()).min(1),
  battleVulnerabilities: z.array(z.string()).min(1),
});

const CharacterInsightsSchema = z.object({
  weaknesses: WeaknessesSchema,
  grade: z.enum([
    "GRADE_4",
    "GRADE_3",
    "GRADE_2",
    "GRADE_1",
    "SPECIAL_GRADE",
  ]),
  balancingNotes: z.array(z.string()).optional(),
});

const BindingVowSchema = z.object({
  sacrifice: z.string(),
  enhancements: z.array(z.string()).min(1),
  conditions: z.array(z.string()).min(1),
  limitations: z.array(z.string()).min(1),
  sideEffects: z.array(z.string()).min(1),
});

export const BattleSummarySchema = z.object({
  winner: z.enum(["fighterA", "fighterB"]),
  title: z.string(),
  opening: z.string(),
  techniquesUsed: z.array(z.string()).min(1),
  weaknessesExploited: z.array(z.string()).min(1),
  domainMoments: z.array(z.string()).optional().default([]),
  turningPoints: z.array(z.string()).min(1),
  finalBlow: z.string(),
  reasonForVictory: z.string(),
  injuries: z.array(z.string()).optional().default([]),
  narrative: z
    .string()
    .min(80, "Narrative must be descriptive enough to recap the battle"),
});

export type CharacterInsights = z.infer<typeof CharacterInsightsSchema>;
export type BindingVowDetails = z.infer<typeof BindingVowSchema>;
export type BattleSummaryPayload = z.infer<typeof BattleSummarySchema>;

function extractJsonCandidate(text: string) {
  if (text.startsWith("```")) {
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch?.[1]) {
      return fenceMatch[1];
    }
  }
  return text;
}

const strictJsonDirective = [
  "Return ONLY valid minified JSON.",
  "Never wrap the JSON in markdown fences or commentary.",
  "Field names and casing must match the provided spec exactly.",
  "If an optional field is unknown, output an empty array or omit it entirely.",
].join("\n");

const characterInsightsSpec = [
  "CharacterInsights object shape:",
  "{",
  '  "weaknesses": {',
  '    "cursedTechniqueDrawbacks": string[1..n],',
  '    "physicalLimitations": string[1..n],',
  '    "personalityFlaws": string[1..n],',
  '    "battleVulnerabilities": string[1..n]',
  "  },",
  '  "grade": one of ["GRADE_4","GRADE_3","GRADE_2","GRADE_1","SPECIAL_GRADE"],',
  '  "balancingNotes"?: string[1..n] (wrap single note inside an array)',
  "}",
].join("\n");

const bindingVowSpec = [
  "BindingVowDetails object shape:",
  "{",
  '  "sacrifice": string,',
  '  "enhancements": string[1..n],',
  '  "conditions": string[1..n],',
  '  "limitations": string[1..n],',
  '  "sideEffects": string[1..n]',
  "}",
].join("\n");

const battleSummarySpec = [
  "BattleSummary object shape:",
  "{",
  '  "winner": "fighterA" or "fighterB" (MUST determine based on comparing all stats, techniques, weaknesses, and matchups)',
  '  "title": string,',
  '  "opening": string,',
  '  "techniquesUsed": string[1..n],',
  '  "weaknessesExploited": string[1..n],',
  '  "domainMoments"?: string[0..n],',
  '  "turningPoints": string[1..n],',
  '  "finalBlow": string,',
  '  "reasonForVictory": string (explain why the winner won based on the stats comparison)',
  '  "injuries"?: string[0..n],',
  '  "narrative": string (>=80 chars)',
  "}",
].join("\n");

async function generateJsonResponse(promptSections: string[]) {
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = client.getGenerativeModel({ model: GEMINI_MODEL });
  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: [strictJsonDirective, ...promptSections].join("\n\n") }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const text = extractJsonCandidate(response.response.text().trim());

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Gemini returned a non-JSON payload");
  }
}

export async function generateCharacterInsights(
  profile: CharacterProfileInput
): Promise<CharacterInsights> {
  const promptSections = [
    "You are an expert judge within the Jujutsu Kaisen universe.",
    "Given the following sorcerer profile, rate their grade and outline weaknesses.",
    characterInsightsSpec,
    "MANDATORY: Each weaknesses array MUST include at least one concrete, lore-accurate item.",
    'MANDATORY: "balancingNotes" must be an array; if you only have one note, wrap it in ["note"].',
    'Remember: "weaknesses" MUST be an object with the four named arrays. Do not return an array there.',
    'Remember: "grade" MUST be exactly one of ["GRADE_4","GRADE_3","GRADE_2","GRADE_1","SPECIAL_GRADE"].',
    `PROFILE:\n${JSON.stringify(profile, null, 2)}`,
  ];

  const json = await generateJsonResponse(promptSections);
  return CharacterInsightsSchema.parse(json);
}

export async function generateBindingVowDetails(
  description: string
): Promise<BindingVowDetails> {
  const promptSections = [
    "You are crafting a Binding Vow for the Jujutsu Kaisen universe.",
    "Respect power balance and ensure all sections are lore-accurate.",
    bindingVowSpec,
    `BINDING VOW CONCEPT:\n${description}`,
  ];

  const json = await generateJsonResponse(promptSections);
  return BindingVowSchema.parse(json);
}

export type FighterStats = {
  name: string;
  grade: string;
  energyLevel: number;
  cursedTechnique: string;
  innateTechnique: string;
  maxTechnique: string;
  domainExpansion: string;
  reverseTechnique?: string | null;
  weaknesses: {
    cursedTechniqueDrawbacks: string[];
    physicalLimitations: string[];
    personalityFlaws: string[];
    battleVulnerabilities: string[];
  };
  bindingVows: Array<{
    name: string;
    sacrifice: string;
    enhancements: string[];
    conditions: string[];
    limitations: string[];
    sideEffects: string[];
  }>;
  wins: number;
  losses: number;
  ranking: number;
};

export type BattleSummaryContext = {
  fighterA: FighterStats;
  fighterB: FighterStats;
};

export async function generateBattleSummary(
  props: BattleSummaryContext
): Promise<BattleSummaryPayload> {
  const promptSections = [
    "You are an expert battle judge in the Jujutsu Kaisen universe.",
    "Analyze both fighters' complete stats, techniques, weaknesses, binding vows, and battle records.",
    "Determine the winner based on:",
    "- Power level and energy reserves",
    "- Technique complexity and versatility",
    "- Weaknesses and how they can be exploited",
    "- Binding vows and their strategic value",
    "- Battle experience (wins/losses/ranking)",
    "- Matchup advantages/disadvantages",
    "The winner should be determined by who would realistically win based on ALL factors, not just raw power.",
    "Consider how weaknesses can be exploited, how techniques counter each other, and strategic elements.",
    battleSummarySpec,
    "CRITICAL: The 'winner' field MUST be either 'fighterA' or 'fighterB' based on your analysis of their stats.",
    `FIGHTER A STATS:\n${JSON.stringify(props.fighterA, null, 2)}`,
    `FIGHTER B STATS:\n${JSON.stringify(props.fighterB, null, 2)}`,
  ];

  const json = await generateJsonResponse(promptSections);

  console.log("Battle result ->", json);
  return BattleSummarySchema.parse(json);
}

const characterGenerationSpec = [
  "CharacterProfile object shape:",
  "{",
  '  "identity": {',
  '    "name": string,',
  '    "gender": string',
  "  },",
  '  "appearance": string (>=30 chars, detailed description),',
  '  "personality": string (>=30 chars, detailed description),',
  '  "backstory": string (>=60 chars, detailed lore),',
  '  "powerSystem": string (>=20 chars, how they manipulate cursed energy),',
  '  "cursedTechnique": string (>=40 chars, primary signature ability),',
  '  "innateTechnique": string (>=40 chars, innate skill),',
  '  "maximumTechnique": string (>=40 chars, trump card),',
  '  "domainExpansion": string (>=40 chars, name and description),',
  '  "reverseTechnique"?: string (>=20 chars, optional healing method),',
  '  "energyLevel": number (1-9999),',
  '  "powerLevelEstimate": string (short descriptor)',
  "}",
].join("\n");

const CharacterGenerationSchema = z.object({
  identity: z.object({
    name: z.string().min(1),
    gender: z.string().min(1),
  }),
  appearance: z.string().min(30),
  personality: z.string().min(30),
  backstory: z.string().min(60),
  powerSystem: z.string().min(20),
  cursedTechnique: z.string().min(40),
  innateTechnique: z.string().min(40),
  maximumTechnique: z.string().min(40),
  domainExpansion: z.string().min(40),
  reverseTechnique: z.string().min(20).optional(),
  energyLevel: z.number().int().min(1).max(9999),
  powerLevelEstimate: z.string().min(1),
});

export type GeneratedCharacter = z.infer<typeof CharacterGenerationSchema>;

export async function generateCharacterFromPrompt(
  prompt: string
): Promise<GeneratedCharacter> {
  const promptSections = [
    "You are an expert character creator in the Jujutsu Kaisen universe.",
    "Generate a complete, lore-accurate sorcerer character based on the user's prompt.",
    "Ensure all fields are detailed, creative, and consistent with Jujutsu Kaisen lore.",
    "Make the character unique and interesting while maintaining power balance.",
    characterGenerationSpec,
    "MANDATORY: All string fields must meet their minimum character requirements.",
    "MANDATORY: energyLevel must be between 1 and 9999.",
    "MANDATORY: reverseTechnique is optional but if included must be >=20 chars.",
    `USER PROMPT:\n${prompt}`,
  ];

  const json = await generateJsonResponse(promptSections);
  return CharacterGenerationSchema.parse(json);
}

