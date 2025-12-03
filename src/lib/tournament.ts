import { Character, SorcererGrade } from "@prisma/client";
import { parseBindingVows, parseWeaknesses } from "./character";

const gradeWeights: Record<SorcererGrade, number> = {
  GRADE_4: 1,
  GRADE_3: 1.2,
  GRADE_2: 1.4,
  GRADE_1: 1.7,
  SPECIAL_GRADE: 2.1,
};

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

function bindingVowBonus(character: Character) {
  return parseBindingVows(character).length * 75;
}

export function gradeMultiplier(grade: SorcererGrade) {
  return gradeWeights[grade] ?? 1;
}

function getWeaknessPenalty(character: Character): number {
  try {
    const weaknesses = parseWeaknesses(character);
    // Count total weaknesses - more weaknesses = more penalty
    const totalWeaknesses =
      weaknesses.cursedTechniqueDrawbacks.length +
      weaknesses.physicalLimitations.length +
      weaknesses.personalityFlaws.length +
      weaknesses.battleVulnerabilities.length;
    
    // Each weakness reduces score by 2% (max 20% penalty for 10+ weaknesses)
    return Math.min(totalWeaknesses * 0.02, 0.2);
  } catch {
    // Default penalty if weaknesses can't be parsed
    return 0.1;
  }
}

export function computeBattleScore(
  character: Character,
  options?: { randomBoost?: number }
) {
  // Technique complexity based on technique descriptions
  const techniqueComplexity =
    character.cursedTechnique.length / 5 +
    character.domainExpansion.length / 6 +
    character.maxTechnique.length / 7 +
    (character.reverseTechnique?.length ?? 0) / 8;
  
  const vowBonus = bindingVowBonus(character);
  
  // Base score calculation
  const base = character.energyLevel + techniqueComplexity + vowBonus;
  
  // Apply grade multiplier
  const gradeAdjusted = base * gradeMultiplier(character.grade);
  
  // Apply weakness penalty (reduces score)
  const weaknessPenalty = getWeaknessPenalty(character);
  const afterWeakness = gradeAdjusted * (1 - weaknessPenalty);
  
  // Apply random variance (wider range for more unpredictability)
  // Range: 0.85 to 1.25 (15% penalty to 25% bonus)
  const variance = options?.randomBoost ?? randomBetween(0.85, 1.25);
  
  return afterWeakness * variance;
}
