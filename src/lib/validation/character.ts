import { z } from "zod";

export const characterFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.string().min(1, "Gender is required"),
  country: z.string().min(2, "Country is required"),
  appearance: z
    .string()
    .min(30, "Describe the appearance in at least 30 characters"),
  personality: z
    .string()
    .min(30, "Describe the personality in at least 30 characters"),
  backstory: z
    .string()
    .min(60, "Backstory must be at least 60 characters for proper lore"),
  powerSystem: z.string().min(10, "Power system description is required"),
  cursedTechnique: z
    .string()
    .min(40, "Explain the cursed technique with at least 40 characters"),
  innateTechnique: z
    .string()
    .min(40, "Innate technique explanation must be at least 40 characters"),
  maxTechnique: z
    .string()
    .min(40, "Maximum technique story must be at least 40 characters"),
  domainExpansion: z
    .string()
    .min(40, "Domain expansion details must be at least 40 characters"),
  reverseTechnique: z.string().optional(),
  energyLevel: z
    .number({
    //  required_error: "Energy level is required",
     // invalid_type_error: "Energy level must be a number",
    })
    .int()
    .min(1, "Energy level must be positive")
    .max(9999, "Energy level is capped at 9999"),
  powerLevelEstimate: z
    .string()
    .min(5, "Provide a short power-level estimate or descriptor"),
});

export type CharacterFormValues = z.infer<typeof characterFormSchema>;
export type CharacterFieldKey = keyof CharacterFormValues;

export const characterUpgradeSchema = z
  .object({
    appearance: z
      .string()
      .min(30, "Appearance updates must add detail.")
      .optional(),
    personality: z
      .string()
      .min(30, "Personality notes must gain depth.")
      .optional(),
    backstory: z
      .string()
      .min(60, "Backstory must expand beyond previous lore.")
      .optional(),
    powerSystem: z
      .string()
      .min(20, "Describe additional facets of the power system.")
      .optional(),
    cursedTechnique: z
      .string()
      .min(40, "Evolve cursed technique with more nuance.")
      .optional(),
    innateTechnique: z
      .string()
      .min(40, "Innate technique expansion required.")
      .optional(),
    maxTechnique: z
      .string()
      .min(40, "Maximum technique update must be descriptive.")
      .optional(),
    domainExpansion: z
      .string()
      .min(40, "Domain expansion details must grow.")
      .optional(),
    reverseTechnique: z
      .string()
      .min(20, "Provide more insight into reverse cursed techniques.")
      .optional(),
    energyLevel: z
      .number({
      //  invalid_type_error: "Energy level must be numeric",
      })
      .int()
      .min(1)
      .max(9999)
      .optional(),
    powerLevelEstimate: z
      .string()
      .min(5, "Power estimate should communicate new scale.")
      .optional(),
  })
  .refine(
    (values) => Object.values(values).some((value) => value !== undefined),
    {
      message: "Provide at least one upgrade before submitting.",
      path: ["_root"],
    }
  );

export type CharacterUpgradeValues = z.infer<typeof characterUpgradeSchema>;

export const bindingVowConceptSchema = z.object({
  name: z
    .string()
    .min(2, "Binding vow name must be at least 2 characters")
    .max(60, "Binding vow name must be less than 60 characters"),
  concept: z
    .string()
    .min(30, "Describe the binding vow concept in at least 30 characters"),
});

export type BindingVowConceptValues = z.infer<typeof bindingVowConceptSchema>;

