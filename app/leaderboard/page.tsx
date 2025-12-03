/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";

export default async function LeaderboardPage({
  searchParams,
}: any) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [leaders, total] = await Promise.all([
    prisma.character.findMany({
      orderBy: [
        { ranking: "asc" },
        { wins: "desc" },
        { losses: "asc" },
      ],
      take: pageSize,
      skip,
      select: {
        id: true,
        name: true,
        grade: true,
        wins: true,
        losses: true,
        ranking: true,
        xp: true,
      },
    }),
    prisma.character.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Full Leaderboard</h1>
            <p className="mt-2 text-sm text-white/40">
              All fighters ranked by performance
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10"
          >
            ← Back Home
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leaders.map((fighter) => (
              <Link
                key={fighter.id}
                href={`/characters/${fighter.id}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white/80">
                        #{fighter.ranking || 0}
                      </span>
                      <h3 className="text-base font-semibold break-words">
                        {fighter.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/40">
                      {fighter.grade.replace("_", " ")}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-white/60">
                      <span>{fighter.wins}W / {fighter.losses}L</span>
                      <span>{fighter.xp} XP</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {leaders.length === 0 && (
            <p className="py-12 text-center text-sm text-white/40">
              No fighters yet. Be the first to enter.
            </p>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/leaderboard?page=${page - 1}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-white/40">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/leaderboard?page=${page + 1}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

