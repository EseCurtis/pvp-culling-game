"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateAndCreateCharacterAction } from "./generate-action";

export function QuickGenerateForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError("Please enter a character description");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await generateAndCreateCharacterAction(prompt);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-black/30 p-6 backdrop-blur">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Quick Generation
        </p>
        <h2 className="mt-3 text-2xl font-semibold">AI-Powered Character Creation</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Describe your sorcerer concept and let AI generate a complete character profile.
          You can always customize details later.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Character Concept
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: A vengeful sorcerer who wields shadow manipulation, trained by a cursed clan, seeks revenge for their fallen mentor..."
            rows={6}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-white"
            disabled={isPending}
          />
          <span className="mt-1 block text-xs text-[var(--muted)]">
            Be as detailed as possible. Include personality, powers, backstory, or any specific elements you want.
          </span>
        </label>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isPending || !prompt.trim()}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white hover:ring-1 hover:ring-white disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? "Generating Character..." : "Generate Character"}
        </button>
      </div>
    </div>
  );
}

