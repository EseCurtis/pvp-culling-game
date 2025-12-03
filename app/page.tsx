/* eslint-disable @typescript-eslint/ban-ts-comment */
import { auth, signIn, signOut } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { SearchableBattleReports } from "./_components/searchable-battle-reports";

export default async function Home() {
  const session = await auth();

  const [leaders, recentFights] = await Promise.all([
    prisma.character.findMany({
      orderBy: [{ ranking: "asc" }, { wins: "desc" }, { losses: "asc" }],
      take: 10,
      select: {
        id: true,
        name: true,
        grade: true,
        wins: true,
        losses: true,
        ranking: true,
        xp: true
      }
    }),
    prisma.fightResult.findMany({
      orderBy: { occurredAt: "desc" },
      take: 100,
      select: {
        id: true,
        character1Id: true,
        character2Id: true,
        round: true,
        occurredAt: true,
        summaryPayload: true,
        winner: { select: { id: true, name: true } },
        loser: { select: { id: true, name: true } }
      }
    })
  ]);

  const topFighter = leaders.at(0);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-black/60 p-6 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                The Culling Game
              </p>
              <h1 className="mt-3 text-4xl font-semibold">
                AI-Driven Sorcerer Battles
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Challenge fighters in real-time battles powered by AI. Each
                battle costs XP to initiate, which is transferred to your
                opponent. Win to earn bonus XP and climb the leaderboard. Sign
                in with Google to create your fighter and enter the arena.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-black/40 p-4">
              {session?.user ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Signed In
                  </p>
                  <p className="text-lg font-medium">
                    {session.user.name ?? session.user.email}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/dashboard"
                      className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] !text-black transition hover:bg-transparent hover:!text-white hover:ring-1 hover:ring-white"
                    >
                      Dashboard
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await signOut();
                      }}
                      className="flex-1"
                    >
                      <button
                        type="submit"
                        className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white"
                      >
                        Leave
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <form
                  action={async () => {
                    "use server";
                    await signIn("google");
                  }}
                  className="space-y-3"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Enter Arena
                  </p>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white hover:ring-1 hover:ring-white"
                  >
                    Sign In With Google
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--border)] bg-black/50 p-5 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Leaderboard</h2>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Rank · Grade · Record
                </span>
                <Link
                  href="/leaderboard"
                  className="text-xs uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
                >
                  View Full →
                </Link>
              </div>
            </div>
            <div className="mt-4 divide-y divide-white/5">
              {leaders.length === 0 && (
                <p className="py-6 text-sm text-[var(--muted)]">
                  No fighters yet. Be the first to enter.
                </p>
              )}
              {leaders.map((fighter) => (
                <Link
                  key={fighter.id}
                  href={`/characters/${fighter.id}`}
                  className="flex items-center gap-4 py-3 text-sm transition hover:bg-white/5 rounded-lg px-2 -mx-2"
                >
                  <span className="text-lg font-semibold text-white/80">
                    #{fighter.ranking || 0}
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-medium">{fighter.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      {fighter.grade.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right text-xs uppercase tracking-[0.3em]">
                    {fighter.wins} / {fighter.losses}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-black/50 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
              Today&apos;s Top Fighter
            </p>
            {topFighter ? (
              <Link
                href={`/characters/${topFighter.id}`}
                className="mt-4 block space-y-2 transition hover:opacity-80"
              >
                <h3 className="text-2xl font-semibold">{topFighter.name}</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {topFighter.grade.replace("_", " ")}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Record {topFighter.wins}W / {topFighter.losses}L
                </p>
              </Link>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Once fighters join, the daily MVP will be crowned here.
              </p>
            )}
          </div>
        </section>
        {/* @ts-ignore */}
        <SearchableBattleReports fights={recentFights} />
      </div>
    </main>
  );
}
