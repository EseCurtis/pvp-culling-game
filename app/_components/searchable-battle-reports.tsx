/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { parseBattleSummary } from "@/src/lib/character";
import { shouldBreakWords, smartTruncate } from "@/src/lib/text-utils";
import type { FightResult } from "@prisma/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BattleReportProps = {
  fights: Array<FightResult & {
    winner: { name: string };
    loser: { name: string };
  }>;
};

export function SearchableBattleReports({ fights }: BattleReportProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFights = useMemo(() => {
    if (!searchQuery.trim()) {
      return fights;
    }

    const query = searchQuery.toLowerCase();
    return fights.filter((fight) => {
      const summary = parseBattleSummary(fight.summaryPayload);
      const winnerName = fight.winner.name.toLowerCase();
      const loserName = fight.loser.name.toLowerCase();
      const title = summary.title.toLowerCase();
      const narrative = summary.narrative.toLowerCase();
      const opening = summary.opening.toLowerCase();

      return (
        winnerName.includes(query) ||
        loserName.includes(query) ||
        title.includes(query) ||
        narrative.includes(query) ||
        opening.includes(query) ||
        summary.techniquesUsed.some((t) => t.toLowerCase().includes(query)) ||
        summary.weaknessesExploited.some((w) => w.toLowerCase().includes(query))
      );
    });
  }, [fights, searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedFights = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFights.slice(startIndex, endIndex);
  }, [filteredFights, currentPage]);

  const totalPages = Math.ceil(filteredFights.length / itemsPerPage);

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-black/50 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Latest Battle Reports</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Full narration · Domain calls · Final blows
          </span>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search battles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-black/40 px-4 py-2.5 pl-10 text-sm text-white placeholder:text-[var(--muted)] focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-white"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
        {searchQuery ? (
          <span>
            {filteredFights.length === 0 ? (
              <>No battles found matching &quot;{searchQuery}&quot;</>
            ) : (
              <>
                Found {filteredFights.length} battle
                {filteredFights.length !== 1 ? "s" : ""}
              </>
            )}
          </span>
        ) : (
          <span>
            Showing {paginatedFights.length} of {filteredFights.length} battles
          </span>
        )}
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      <div className="mt-4 divide-y divide-white/5">
        {filteredFights.length === 0 && !searchQuery && (
          <p className="py-6 text-sm text-[var(--muted)]">
            Summaries will appear after the first tournament concludes.
          </p>
        )}
        {filteredFights.length === 0 && searchQuery && (
          <p className="py-6 text-sm text-[var(--muted)]">
            No battles match your search. Try different keywords like fighter
            names, techniques, or battle titles.
          </p>
        )}
        {paginatedFights.map((fight) => {
          const summary = parseBattleSummary(fight.summaryPayload);
          return (
            <div
              key={fight.id}
              className="flex flex-col gap-2 py-4 transition hover:bg-white/5 md:flex-row md:items-center md:gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] break-words">
                    <Link
                      href={`/characters/${(fight.winner as any).id}`}
                      className="text-white/80 hover:text-white transition underline"
                    >
                      {fight.winner.name}
                    </Link>{" "}
                    vs{" "}
                    <Link
                      href={`/characters/${(fight.loser as any).id}`}
                      className="text-white/80 hover:text-white transition underline"
                    >
                      {fight.loser.name}
                    </Link>
                  </p>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(fight.occurredAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-base font-semibold break-words">{summary.title}</p>
                <p className={`text-sm text-[var(--muted)] line-clamp-2 ${shouldBreakWords(summary.narrative) ? "break-words" : ""}`}>
                  {smartTruncate(summary.narrative, 200)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {summary.techniquesUsed.slice(0, 3).map((technique) => (
                    <span
                      key={technique}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-[var(--muted)]"
                    >
                      {technique}
                    </span>
                  ))}
                  {summary.techniquesUsed.length > 3 && (
                    <span className="text-xs text-[var(--muted)]">
                      +{summary.techniquesUsed.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <Link
                className="shrink-0 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
                href={`/fights/${fight.id}`}
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
    </section>
  );
}

