"use client";

import {
  CharacterFormValues,
  characterFormSchema,
} from "@/src/lib/validation/character";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { createCharacterAction } from "./actions";
import { COUNTRIES } from "@/src/lib/countries";

type FieldKey = keyof CharacterFormValues;

type FieldConfig = {
  label: string;
  hint: string;
  placeholder?: string;
  minChars?: number;
  type?: "textarea" | "number" | "text" | "select";
};

const fieldConfig: Record<FieldKey, FieldConfig> = {
  name: {
    label: "Identity Name",
    hint: "Name that echoes across the Culling Game.",
    placeholder: "Ryomen Sukuna, Satoru Gojo…",
  },
  gender: {
    label: "Gender / Presentation",
    hint: "How they present themselves on the battlefield.",
    placeholder: "Male-presenting, androgynous, cursed puppet, etc.",
  },
  country: {
    label: "Country",
    hint: "Select your country for payment processing.",
    placeholder: "Select country...",
    type: "select",
  },
  appearance: {
    label: "Appearance",
    hint: "Paint the silhouette from hair to cursed markings.",
    placeholder:
      "Describe hairstyle, cursed marks, outfit, height, notable traits…",
    minChars: 30,
    type: "textarea",
  },
  personality: {
    label: "Personality",
    hint: "Temperament, attitude, and battlefield posture.",
    placeholder:
      "Cold tactician, playful sadist, stoic guardian… include quirks.",
    minChars: 30,
    type: "textarea",
  },
  backstory: {
    label: "Backstory",
    hint: "Lore, origin, mentors, tragedies, motivations.",
    placeholder: "Found on cursed grounds, trained by clan elders, etc.",
    minChars: 60,
    type: "textarea",
  },
  powerSystem: {
    label: "Power System",
    hint: "How they manipulate cursed energy day-to-day.",
    placeholder: "Explain cursed energy control, catalysts, rituals.",
    minChars: 20,
    type: "textarea",
  },
  cursedTechnique: {
    label: "Cursed Technique",
    hint: "Primary signature ability and mechanics.",
    placeholder: "Mechanics, rules, costs, counter-play.",
    minChars: 40,
    type: "textarea",
  },
  innateTechnique: {
    label: "Innate Technique",
    hint: "Elaborate on innate skill interactions and limits.",
    placeholder: "Explain innate gift and constraints/trigger.",
    minChars: 40,
    type: "textarea",
  },
  maxTechnique: {
    label: "Maximum Technique",
    hint: "Describe trump card activation + drawbacks.",
    placeholder: "What happens when unleashed? What is sacrificed?",
    minChars: 40,
    type: "textarea",
  },
  domainExpansion: {
    label: "Domain Expansion",
    hint: "Name, environment, guaranteed hit effect.",
    placeholder: "Give it a name—describe terrain + guaranteed hit.",
    minChars: 40,
    type: "textarea",
  },
  reverseTechnique: {
    label: "Reverse Cursed Technique",
    hint: "Optional healing or inversion method.",
    placeholder: "How do they heal or invert cursed energy?",
    minChars: 20,
    type: "textarea",
  },
  energyLevel: {
    label: "Cursed Energy Level",
    hint: "Numeric intensity (1-9999).",
    type: "number",
  },
  powerLevelEstimate: {
    label: "Power Estimate",
    hint: "Short descriptor (e.g., 'City-level exorcist').",
    placeholder: "Example: 'Special Grade · city-level threat'.",
  },
};

const steps: Array<{
  title: string;
  description: string;
  fields: FieldKey[];
}> = [
  {
    title: "Identity",
    description: "Who walks into the arena?",
    fields: ["name", "gender", "country", "appearance", "personality"],
  },
  {
    title: "Lore & Resolve",
    description: "What forged their resolve?",
    fields: ["backstory", "powerSystem"],
  },
  {
    title: "Cursed Arsenal",
    description: "Outline every technique and limitation.",
    fields: [
      "cursedTechnique",
      "innateTechnique",
      "maxTechnique",
      "domainExpansion",
      "reverseTechnique",
    ],
  },
  {
    title: "Power Calibration",
    description: "Lock in raw numbers and estimations.",
    fields: ["energyLevel", "powerLevelEstimate"],
  },
];

const stepIndexByField = steps.reduce<Record<FieldKey, number>>((acc, step, index) => {
  step.fields.forEach((field) => {
    acc[field] = index;
  });
  return acc;
}, {} as Record<FieldKey, number>);
const validFieldKeys = new Set<FieldKey>(Object.keys(fieldConfig) as FieldKey[]);

function createPickShape(keys: FieldKey[]): Partial<Record<FieldKey, true>> {
  return keys.reduce((shape, key) => {
    shape[key] = true;
    return shape;
  }, {} as Partial<Record<FieldKey, true>>);
}

const stepSchemas = steps.map((step) =>
  characterFormSchema.pick(createPickShape(step.fields))
);

export function CharacterOnboardingForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: defaultName,
      gender: "",
      country: "",
      appearance: "",
      personality: "",
      backstory: "",
      powerSystem: "",
      cursedTechnique: "",
      innateTechnique: "",
      maxTechnique: "",
      domainExpansion: "",
      reverseTechnique: "",
      energyLevel: 800,
      powerLevelEstimate: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const currentStep = steps[step];
  const totalSteps = steps.length;
  const values = watch();
  const displayName = values.name || defaultName;

  async function handleNext() {
    const currentValues = getValues();
    const stepSchema = stepSchemas[step];
    const result = stepSchema.safeParse(currentValues);

    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      currentStep.fields.forEach((field) => {
        const message = flattened[field]?.[0];
        if (message) {
          setError(field, { type: "manual", message });
        }
      });
      setFormError("Fill in the highlighted fields before continuing.");
      return;
    }

    clearErrors(currentStep.fields);
    setFormError(null);
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }

  function handlePrevious() {
    setFormError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  const onSubmit = handleSubmit(
    (values) => {
      setFormError(null);
      clearErrors();
      startTransition(async () => {
        try {
          const result = await createCharacterAction(values);
          if (result?.error) {
            if (result.fieldErrors) {
              let targetStep = step;
              (Object.entries(result.fieldErrors) as Array<[FieldKey, string]>).forEach(
                ([field, message]) => {
                  if (!message || !validFieldKeys.has(field)) {
                    return;
                  }
                  setError(field, { type: "server", message });
                  const candidateStep = stepIndexByField[field];
                  if (typeof candidateStep === "number") {
                    targetStep = Math.min(targetStep, candidateStep);
                  }
                }
              );
              setStep(targetStep);
            }
            setFormError(result.error);
            return;
          }
          router.push("/dashboard");
        } catch (error) {
          if (error instanceof Error) {
            setFormError(error.message);
          } else {
            setFormError("Something went wrong while validating your fighter.");
          }
        }
      });
    },
    (invalidErrors) => {
      const firstField = Object.keys(invalidErrors)[0] as FieldKey | undefined;
      if (firstField) {
        const target = stepIndexByField[firstField];
        if (typeof target === "number") {
          setStep(target);
        }
      }
      setFormError("Add more detail to the highlighted sections before continuing.");
    }
  );

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[var(--border)] bg-black/30 p-6 backdrop-blur"
    >
      <StepIndicator currentStep={step} errors={errors} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Step {step + 1} / {totalSteps}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{currentStep.title}</h2>
          <p className="text-sm text-[var(--muted)]">
            {currentStep.description}
          </p>
        </div>
        <div className="hidden text-right text-xs uppercase tracking-[0.4em] text-[var(--muted)] sm:block">
          {displayName}
        </div>
      </div>

      <StepErrorSummary currentStep={currentStep} errors={errors} />
      <div className="mt-6 space-y-5">
        {currentStep.fields.map((field) => {
          const config = fieldConfig[field];
          const error = errors[field]?.message;
          const currentValue = values[field];
          const charCount = typeof currentValue === "string" ? currentValue.length : 0;
          const sharedClasses =
            "w-full rounded-2xl border border-[var(--border)] bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-white";
          if (config.type === "textarea") {
            return (
              <label key={field} className="block text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {config.label}
                </span>
                <textarea
                  {...register(field)}
                  rows={4}
                  className={
                    sharedClasses + (error ? " border-red-500 focus:border-red-500" : "")
                  }
                  placeholder={config.placeholder ?? config.hint}
                />
                <span className="mt-1 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>{config.hint}</span>
                  {config.minChars && (
                    <span
                      className={
                        charCount < config.minChars ? "text-red-400" : "text-[var(--muted)]"
                      }
                    >
                      {charCount}/{config.minChars} chars
                    </span>
                  )}
                </span>
                {error && (
                  <span className="mt-1 block text-xs text-red-400">
                    {error}
                  </span>
                )}
              </label>
            );
          }

          if (config.type === "select") {
            return (
              <label key={field} className="block text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {config.label}
                </span>
                <select
                  {...register(field)}
                  className={
                    sharedClasses + (error ? " border-red-500 focus:border-red-500" : "")
                  }
                >
                  <option value="">{config.placeholder ?? "Select..."}</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <span className="mt-1 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>{config.hint}</span>
                </span>
                {error && (
                  <span className="mt-1 block text-xs text-red-400">
                    {error}
                  </span>
                )}
              </label>
            );
          }

          return (
            <label key={field} className="block text-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {config.label}
              </span>
              <input
                {...register(field, { valueAsNumber: config.type === "number" })}
                type={config.type ?? "text"}
                className={
                  sharedClasses + (error ? " border-red-500 focus:border-red-500" : "")
                }
                placeholder={config.placeholder ?? config.hint}
              />
              <span className="mt-1 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>{config.hint}</span>
                {config.type === "number" && (
                  <span className="text-[var(--muted)]">Range 1 – 9999</span>
                )}
              </span>
              {error && (
                <span className="mt-1 block text-xs text-red-400">
                  {error}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {formError && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {formError}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white"
            disabled={isPending}
          >
            Back
          </button>
        )}
        {step < totalSteps - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white hover:ring-1 hover:ring-white"
            disabled={isPending}
          >
            Continue
          </button>
        )}
        {step === totalSteps - 1 && (
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white hover:ring-1 hover:ring-white disabled:cursor-wait disabled:opacity-70"
            disabled={isPending}
          >
            {isPending ? "Validating..." : "Summon Sorcerer"}
          </button>
        )}
      </div>
    </form>
  );
}

function StepIndicator({
  currentStep,
  errors,
}: {
  currentStep: number;
  errors: FieldErrors<CharacterFormValues>;
}) {
  return (
    <ol className="mb-6 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.3em]">
      {steps.map((step, index) => {
        const hasError = step.fields.some((field) => errors[field]);
        const state =
          index < currentStep
            ? "bg-white text-black"
            : index === currentStep
            ? hasError
              ? "border-red-500 text-red-400"
              : "border-white text-white"
            : hasError
            ? "border-red-500/60 text-red-400"
            : "border-[var(--border)] text-[var(--muted)]";
        return (
          <li
            key={step.title}
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${state}`}
          >
            <span>{index + 1}</span>
            <span>{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}

function StepErrorSummary({
  currentStep,
  errors,
}: {
  currentStep: (typeof steps)[number];
  errors: FieldErrors<CharacterFormValues>;
}) {
  const stepErrors = useMemo(
    () => currentStep.fields.filter((field) => errors[field]),
    [currentStep, errors]
  );

  if (stepErrors.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
      <p className="font-semibold tracking-[0.3em]">Step Needs Attention</p>
      <ul className="mt-2 space-y-1">
        {stepErrors.map((field) => (
          <li key={field}>{fieldConfig[field].label}</li>
        ))}
      </ul>
    </div>
  );
}


