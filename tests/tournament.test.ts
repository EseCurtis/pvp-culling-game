import { describe, expect, it } from "vitest";
import type { Character, SorcererGrade } from "@prisma/client";
import { computeBattleScore, gradeMultiplier } from "@/src/lib/tournament";

function buildCharacter(overrides?: Partial<Character>): Character {
  const base: Character = {
    id: "char",
    userId: "user",
    name: "Test Fighter",
    gender: "Unknown",
    appearance: "Tall silhouette with cursed markings",
    personality: "Calm and calculating tactician",
    backstory: "Raised in the shadows of Kyoto and trained in secret arts.",
    powerSystem: "Manipulates sound-based cursed energy vibrations.",
    cursedTechnique:
      "Echo Severance: slicing waves tuned to cursed frequencies.",
    innateTechnique: "Sonic Bloom: Creates harmonic traps mid-air.",
    maxTechnique: "Resonant Guillotine: Amplifies every wave into crescents.",
    domainExpansion: "Silent Auditorium",
    reverseTechnique: null,
    energyLevel: 800,
    powerLevelEstimate: "City level",
    grade: "GRADE_2",
    weaknesses: {
      cursedTechniqueDrawbacks: ["Requires rhythm"],
      physicalLimitations: ["Fragile hearing"],
      personalityFlaws: ["Overconfident"],
      battleVulnerabilities: ["Poor against sustained pressure"],
    },
    balancingNotes: [],
    bindingVows: [],
    wins: 0,
    losses: 0,
    ranking: 0,
    lastFoughtAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { ...base, ...(overrides ?? {}) };
}

describe("tournament helpers", () => {
  it("returns expected grade multipliers", () => {
    const pairs: Array<[SorcererGrade, number]> = [
      ["GRADE_4", 1],
      ["GRADE_3", 1.2],
      ["GRADE_2", 1.4],
      ["GRADE_1", 1.7],
      ["SPECIAL_GRADE", 2.1],
    ];

    for (const [grade, weight] of pairs) {
      expect(gradeMultiplier(grade)).toBeCloseTo(weight);
    }
  });

  it("scores higher grade fighters above lower grade ones", () => {
    const lowGrade = buildCharacter({ grade: "GRADE_3", energyLevel: 700 });
    const highGrade = buildCharacter({
      id: "high",
      grade: "SPECIAL_GRADE",
      energyLevel: 700,
    });

    const lowScore = computeBattleScore(lowGrade, { randomBoost: 1.1 });
    const highScore = computeBattleScore(highGrade, { randomBoost: 1.1 });

    expect(highScore).toBeGreaterThan(lowScore);
  });

  it("rewards binding vows", () => {
    const withoutVow = buildCharacter({ id: "no-vow" });
    const withVow = buildCharacter({
      id: "with-vow",
      bindingVows: [
        {
          name: "Eclipse",
          sacrifice: "Loses sight temporarily",
          enhancements: ["Doubles domain speed"],
          conditions: ["Must chant"],
          limitations: ["Costs stamina"],
          sideEffects: ["Severe headaches"],
        },
      ],
    });

    const baseScore = computeBattleScore(withoutVow, { randomBoost: 1.1 });
    const vowScore = computeBattleScore(withVow, { randomBoost: 1.1 });

    expect(vowScore).toBeGreaterThan(baseScore);
  });
});



