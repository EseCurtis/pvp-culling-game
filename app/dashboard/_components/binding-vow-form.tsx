"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bindingVowConceptSchema,
  type BindingVowConceptValues,
} from "@/src/lib/validation/character";
import { createBindingVowAction } from "../actions";

type Props = {
  existingCount: number;
};

export function BindingVowForm({ existingCount }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BindingVowConceptValues>({
    resolver: zodResolver(bindingVowConceptSchema),
    defaultValues: {
      name: "",
      concept: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await createBindingVowAction(values);
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      reset();
      setMessage("Binding vow accepted. Gemini rebalanced your fighter.");
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[var(--border)] bg-black/40 p-6"
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Binding Vows ({existingCount})
        </p>
        <h3 className="text-2xl font-semibold">Craft New Sacrifices</h3>
        <p className="text-sm text-[var(--muted)]">
          Explain what your fighter gives up. Gemini will lock in sacrifices,
          enhancements, and consequences.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Binding Vow Name
          </span>
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white"
            placeholder="e.g., Eclipse Covenant"
            {...register("name")}
          />
          {errors.name?.message && (
            <span className="text-xs text-red-400">{errors.name.message}</span>
          )}
        </label>

        <label className="block text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Concept & Intent
          </span>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white"
            placeholder="Describe the sacrifice, boost, and conditions."
            {...register("concept")}
          />
          {errors.concept?.message && (
            <span className="text-xs text-red-400">
              {errors.concept.message}
            </span>
          )}
        </label>
      </div>

      {message && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <button
        type="submit"
        className="mt-5 w-full rounded-2xl border border-white/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "Consulting AI..." : "Forge Binding Vow"}
      </button>
    </form>
  );
}



