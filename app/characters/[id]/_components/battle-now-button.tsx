"use client";

import { businessLogicConfig } from "@/src/lib/business-logic.config";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signInToBattle } from "../_actions";

type BattleNowButtonProps = {
  opponentId: string;
  opponentName: string;
  userXp: number | null;
  isLoggedIn: boolean;
};

export function BattleNowButton({
  opponentId,
  userXp,
  isLoggedIn,
}: BattleNowButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const battleCost = businessLogicConfig.xp.battleCost;
  const hasEnoughXp = userXp !== null && userXp >= battleCost;

  const handleBattle = async () => {
    // If not logged in, redirect to sign in
    if (!isLoggedIn) {
      await signInToBattle();
      return;
    }

    // If logged in but no character or insufficient XP
    if (userXp === null) {
      router.push("/onboarding");
      return;
    }

    if (!hasEnoughXp) {
      setError(`Insufficient XP. You need ${battleCost} XP but only have ${userXp} XP.`);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/fight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opponentId }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Fight failed");
          return;
        }

        // Redirect to fight result page
        router.push(`/fights/${data.fightId}`);
        router.refresh();
      } catch (error) {
        console.error("Fight error:", error);
        setError("Failed to start fight");
      }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-2">
        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400 backdrop-blur-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-200"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
        <button
          onClick={handleBattle}
          disabled={isPending || (isLoggedIn && userXp !== null && !hasEnoughXp)}
          className="group relative rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
              {isLoggedIn ? "Fighting..." : "Signing in..."}
            </span>
          ) : !isLoggedIn ? (
            "Sign in to Battle Now"
          ) : hasEnoughXp ? (
            `Battle Now (${battleCost} XP)`
          ) : (
            `Need ${battleCost} XP`
          )}
        </button>
      </div>
    </div>
  );
}

