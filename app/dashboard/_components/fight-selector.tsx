"use client";

import { businessLogicConfig } from "@/src/lib/business-logic.config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Character = {
  id: string;
  name: string;
  grade: string;
  wins: number;
  losses: number;
  ranking: number;
  xp: number;
};

type FightSelectorProps = {
  availableOpponents: Character[];
  userCharacterId: string;
  userXp: number;
};

export function FightSelector({
  availableOpponents,
  userXp,
}: FightSelectorProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const battleCost = businessLogicConfig.xp.battleCost;
  const hasEnoughXp = userXp >= battleCost;

  const handleFight = () => {
    if (!selectedOpponent) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/fight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opponentId: selectedOpponent }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Fight failed");
          return;
        }

        // Redirect to fight result page
        router.push(`/fights/${data.fightId}`);
        router.refresh();
      } catch (error) {
        console.error("Fight error:", error);
        alert("Failed to start fight");
      }
    });
  };

  const selectedOpponentData = availableOpponents.find(
    (c) => c.id === selectedOpponent
  );

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Challenge a Fighter</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Select an opponent and initiate a battle. Cost: {battleCost} XP per challenge.
        </p>
        {!hasEnoughXp && (
          <p className="mt-2 text-xs text-red-400">
            ⚠️ Insufficient XP. You need {battleCost} XP but only have {userXp} XP.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Choose Opponent
          </label>
          <select
            value={selectedOpponent}
            onChange={(e) => setSelectedOpponent(e.target.value)}
            disabled={isPending}
            className="w-full rounded-xl border border-[var(--border)] bg-black/60 px-4 py-3 text-white transition hover:border-white/30 focus:border-white/50 focus:outline-none disabled:opacity-50"
          >
            <option value="">Select a fighter...</option>
            {availableOpponents.map((opponent) => (
              <option key={opponent.id} value={opponent.id}>
                {opponent.name} ({opponent.grade.replace("_", " ")}) - {opponent.wins}W / {opponent.losses}L - Rank #{opponent.ranking} - {opponent.xp} XP
              </option>
            ))}
          </select>
        </div>

        {selectedOpponentData && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/characters/${selectedOpponentData.id}`}
                  className="text-sm font-semibold hover:text-white/80 transition break-words"
                >
                  {selectedOpponentData.name}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  {selectedOpponentData.grade.replace("_", " ")} · Rank #
                  {selectedOpponentData.ranking}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {selectedOpponentData.wins}W / {selectedOpponentData.losses}L · {selectedOpponentData.xp} XP
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleFight}
          disabled={!selectedOpponent || isPending || !hasEnoughXp}
          className="w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white hover:ring-1 hover:ring-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Fighting..." : hasEnoughXp ? `Start Battle (${battleCost} XP)` : `Insufficient XP (Need ${battleCost})`}
        </button>
      </div>
    </div>
  );
}

