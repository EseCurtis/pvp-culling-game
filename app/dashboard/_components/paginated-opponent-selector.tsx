"use client";

import { businessLogicConfig } from "@/src/lib/business-logic.config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type Character = {
  id: string;
  name: string;
  grade: string;
  wins: number;
  losses: number;
  ranking: number;
  xp: number;
};

type PaginatedOpponentSelectorProps = {
  userCharacterId: string;
  userXp: number;
};

export function PaginatedOpponentSelector({
  userXp,
}: PaginatedOpponentSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<Character | null>(null);
  const [opponents, setOpponents] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasMore: false,
    total: 0,
  });
  const [isPending, startTransition] = useTransition();

  const battleCost = businessLogicConfig.xp.battleCost;
  const hasEnoughXp = userXp >= battleCost;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Fetch opponents
  useEffect(() => {
    if (!isOpen) return;

    async function fetchOpponents() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/characters/opponents?page=${currentPage}&search=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        if (response.ok) {
          setOpponents(data.opponents || []);
          setPagination(data.pagination || pagination);
        }
      } catch (error) {
        console.error("Failed to fetch opponents", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOpponents();
  }, [isOpen, currentPage, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [searchQuery, isOpen]);

  const handleFight = () => {
    if (!selectedOpponent) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/fight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opponentId: selectedOpponent.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Fight failed");
          return;
        }

        router.push(`/fights/${data.fightId}`);
        router.refresh();
      } catch (error) {
        console.error("Fight error:", error);
        alert("Failed to start fight");
      }
    });
  };

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
        {/* Custom Dropdown */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Choose Opponent
          </label>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isPending}
            className="w-full rounded-xl border border-[var(--border)] bg-black/60 px-4 py-3 text-left text-white transition hover:border-white/30 focus:border-white/50 focus:outline-none disabled:opacity-50"
          >
            {selectedOpponent ? (
              <div className="flex items-center justify-between">
                <span className="break-words">
                  {selectedOpponent.name} ({selectedOpponent.grade.replace("_", " ")}) - Rank #
                  {selectedOpponent.ranking}
                </span>
                <span className="ml-2 text-xs text-white/40">▼</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white/50">Select a fighter...</span>
                <span className="ml-2 text-xs text-white/40">▼</span>
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="relative mt-2" ref={dropdownRef}>
              <div className="absolute z-10 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur-sm shadow-xl">
                {/* Search */}
                <div className="border-b border-white/10 p-3">
                  <input
                    type="text"
                    placeholder="Search fighters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Opponents List */}
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-sm text-white/40">
                      Loading...
                    </div>
                  ) : opponents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-white/40">
                      No fighters found
                    </div>
                  ) : (
                    <>
                      {opponents.map((opponent) => (
                        <button
                          key={opponent.id}
                          onClick={() => {
                            setSelectedOpponent(opponent);
                            setIsOpen(false);
                          }}
                          className={`w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/10 ${
                            selectedOpponent?.id === opponent.id
                              ? "bg-white/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold break-words truncate">
                                {opponent.name}
                              </p>
                              <p className="text-xs text-white/60 mt-1">
                                {opponent.grade.replace("_", " ")} · Rank #{opponent.ranking} ·{" "}
                                {opponent.wins}W / {opponent.losses}L · {opponent.xp} XP
                              </p>
                            </div>
                            {selectedOpponent?.id === opponent.id && (
                              <span className="ml-2 text-xs">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="border-t border-white/10 p-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ← Prev
                      </button>
                      <span className="text-xs text-white/60">
                        Page {currentPage} of {pagination.totalPages} ({pagination.total} total)
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
                        }
                        disabled={currentPage === pagination.totalPages || loading}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Opponent Preview */}
        {selectedOpponent && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Link
                  href={`/characters/${selectedOpponent.id}`}
                  className="text-sm font-semibold hover:text-white/80 transition break-words"
                >
                  {selectedOpponent.name}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  {selectedOpponent.grade.replace("_", " ")} · Rank #
                  {selectedOpponent.ranking}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {selectedOpponent.wins}W / {selectedOpponent.losses}L · {selectedOpponent.xp} XP
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
          {isPending
            ? "Fighting..."
            : hasEnoughXp
              ? `Start Battle (${battleCost} XP)`
              : `Insufficient XP (Need ${battleCost})`}
        </button>
      </div>
    </div>
  );
}

