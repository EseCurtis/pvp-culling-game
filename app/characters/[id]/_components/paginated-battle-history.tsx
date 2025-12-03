"use client";

import { parseBattleSummary } from "@/src/lib/character";
import Link from "next/link";
import { useMemo, useState } from "react";

type Fight = {
  id: string;
  occurredAt: Date | string;
  summaryPayload: unknown;
  opponent: { id: string; name: string };
  result: string;
};

type PaginatedBattleHistoryProps = {
  fights: Fight[];
};

export function PaginatedBattleHistory({ fights }: PaginatedBattleHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedFights = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fights.slice(startIndex, endIndex);
  }, [fights, currentPage]);

  const totalPages = Math.ceil(fights.length / itemsPerPage);

  if (fights.length === 0) {
    return (
      <p className="py-6 text-sm text-white/40">
        No battles yet. This fighter hasn&apos;t entered the arena.
      </p>
    );
  }

  return (
    <>
      <div className="divide-y divide-white/5">
        {paginatedFights.map((fight) => {
          const summary = parseBattleSummary(fight.summaryPayload as never);
          return (
            <div
              key={fight.id}
              className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-xs uppercase tracking-[0.3em] ${
                      fight.result === "WIN" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {fight.result} vs{" "}
                    <Link
                      href={`/characters/${fight.opponent.id}`}
                      className="hover:text-white transition underline"
                    >
                      {fight.opponent.name}
                    </Link>
                  </p>
                  <span className="text-xs text-white/40">
                    {new Date(fight.occurredAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-base font-semibold break-words">{summary.title}</p>
                <p className="text-sm text-white/60 line-clamp-2 break-words">
                  {summary.opening}
                </p>
              </div>
              <Link
                href={`/fights/${fight.id}`}
                className="shrink-0 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
              >
                Read Summary →
              </Link>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="px-4 text-sm text-white/60">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

