"use client";

import { useState } from "react";
import { CharacterOnboardingForm } from "./character-form";
import { QuickGenerateForm } from "./quick-generate-form";

type Mode = "quick" | "detailed";

export function OnboardingModeSelector({ defaultName }: { defaultName: string }) {
  const [mode, setMode] = useState<Mode | null>(null);

  if (mode === null) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <button
          onClick={() => setMode("quick")}
          className="group rounded-3xl border border-[var(--border)] bg-black/30 p-6 backdrop-blur transition hover:border-white hover:bg-black/50"
        >
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
              Quick Start
            </p>
            <h2 className="mt-3 text-2xl font-semibold">AI Generation</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Describe your character concept and let AI generate a complete profile instantly.
              Perfect if you want to get started quickly.
            </p>
            <div className="mt-4 text-xs uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition">
              Generate →
            </div>
          </div>
        </button>

        <button
          onClick={() => setMode("detailed")}
          className="group rounded-3xl border border-[var(--border)] bg-black/30 p-6 backdrop-blur transition hover:border-white hover:bg-black/50"
        >
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
              Full Control
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Detailed Form</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Build your character step-by-step with complete control over every detail.
              Best for players who want to craft every aspect.
            </p>
            <div className="mt-4 text-xs uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition">
              Build →
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setMode(null)}
        className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--muted)] transition hover:text-white"
      >
        ← Back to Options
      </button>
      {mode === "quick" ? (
        <QuickGenerateForm defaultName={defaultName} />
      ) : (
        <CharacterOnboardingForm defaultName={defaultName} />
      )}
    </div>
  );
}

