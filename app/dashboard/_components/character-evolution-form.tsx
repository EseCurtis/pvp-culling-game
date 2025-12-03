"use client";

import {
  type CharacterUpgradeValues,
  characterUpgradeSchema,
} from "@/src/lib/validation/character";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateCharacterAction } from "../actions";

type Props = {
  context: {
    appearance: string;
    personality: string;
    backstory: string;
    powerSystem: string;
    cursedTechnique: string;
    innateTechnique: string;
    maxTechnique: string;
    domainExpansion: string;
    reverseTechnique?: string | null;
    energyLevel: number;
    powerLevelEstimate: string;
  };
};

type TextFieldKey = keyof CharacterUpgradeValues;

const textFields: Array<{
  name: TextFieldKey;
  label: string;
  hint: string;
}> = [
  {
    name: "appearance",
    label: "Appearance Update",
    hint: "Expand visuals, markings, outfits.",
  },
  {
    name: "personality",
    label: "Personality Growth",
    hint: "Add new quirks or convictions.",
  },
  {
    name: "backstory",
    label: "Backstory Chapter",
    hint: "Describe new trials or mentors.",
  },
  {
    name: "powerSystem",
    label: "Power System Refinement",
    hint: "Clarify cursed energy control.",
  },
  {
    name: "cursedTechnique",
    label: "Cursed Technique Expansion",
    hint: "Detail new applications or counters.",
  },
  {
    name: "innateTechnique",
    label: "Innate Technique Upgrade",
    hint: "Explain deeper mechanics or evolution.",
  },
  {
    name: "maxTechnique",
    label: "Maximum Technique Upgrade",
    hint: "Reveal boosts, sacrifices, or new triggers.",
  },
  {
    name: "domainExpansion",
    label: "Domain Expansion Detail",
    hint: "Describe new guaranteed hits or terrain.",
  },
  {
    name: "reverseTechnique",
    label: "Reverse Cursed Technique",
    hint: "Healing strategy or limitations.",
  },
  {
    name: "powerLevelEstimate",
    label: "Power Estimate",
    hint: "Summarize new destructive scale.",
  },
];

export function CharacterEvolutionForm({ context }: Props) {
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CharacterUpgradeValues>({
    resolver: zodResolver(characterUpgradeSchema),
    defaultValues: {},
  });

  const watchedValues = watch();

  const textRegister = (name: TextFieldKey) =>
    register(name, {
      setValueAs: (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      },
    });

  const calculateEnergyIncrease = (values: CharacterUpgradeValues): number => {
    let increase = 0;
    if (values.domainExpansion) increase += 50;
    if (values.reverseTechnique) increase += 30;
    if (values.maxTechnique) increase += 40;
    if (values.cursedTechnique || values.innateTechnique) increase += 20;
    if (values.powerSystem) increase += 15;
    if (values.backstory || values.personality) increase += 10;
    return increase;
  };

  const onSubmit = handleSubmit((values) => {
    setFormMessage(null);
    const energyIncrease = calculateEnergyIncrease(values);
    startTransition(async () => {
      const result = await updateCharacterAction(values);
      if (result?.error) {
        setFormMessage(result.error);
        return;
      }
      const message = energyIncrease > 0
        ? `Upgrade submitted. Energy level increased by ${energyIncrease} through mastery. AI recalibrated your ranking.`
        : "Upgrade submitted. AI recalibrated your ranking.";
      setFormMessage(message);
    });
  });

  const previewEnergyIncrease = calculateEnergyIncrease(watchedValues);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[var(--border)] bg-black/40 p-6"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Evolve Your Sorcerer
        </p>
        <h3 className="text-2xl font-semibold">Upgrades Only Move Forward</h3>
        <p className="text-sm text-[var(--muted)]">
          Add depth, new layers, or higher output. Gemini rebalances the grade,
          weaknesses, and records.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        {textFields.map((field) => (
          <label key={field.name} className="block text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {field.label}
              </span>
              <textarea
                rows={3}
                placeholder={`${field.hint} (Current length: ${
                  typeof (context as Record<string, unknown>)[
                    field.name as string
                  ] === "string"
                    ? (
                        (context as unknown as Record<string, string | undefined>)[
                          field.name as string
                        ] ?? ""
                      ).length
                    : 0
                } chars)`}
                className="w-full rounded-2xl border border-[var(--border)] bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white"
                {...textRegister(field.name)}
              />
              {errors[field.name]?.message && (
                <span className="text-xs text-red-400">
                  {errors[field.name]?.message}
                </span>
              )}
            </div>
          </label>
        ))}

        <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Cursed Energy Level
          </p>
          <p className="mt-2 text-sm text-white/80">
            Current: <span className="font-semibold">{context.energyLevel}</span>
            {previewEnergyIncrease > 0 && (
              <span className="ml-2 text-green-400">
                → {context.energyLevel + previewEnergyIncrease} (+{previewEnergyIncrease})
              </span>
            )}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Energy level increases automatically through:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
            <li>• Winning battles (+10) / Losing battles (+5)</li>
            <li>• Creating binding vows (+25 per vow)</li>
            <li>• Domain expansion mastery (+50)</li>
            <li>• Reverse cursed technique mastery (+30)</li>
            <li>• Maximum technique evolution (+40)</li>
            <li>• Technique refinement (+20)</li>
            <li>• Power system refinement (+15)</li>
            <li>• Character growth (+10)</li>
          </ul>
        </div>
      </div>

      {formMessage && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          {formMessage}
        </div>
      )}

      <button
        type="submit"
        className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-transparent hover:text-white hover:ring-1 hover:ring-white disabled:cursor-wait disabled:opacity-70"
        disabled={isPending}
      >
        {isPending ? "Balancing..." : "Submit Upgrades"}
      </button>
    </form>
  );
}


