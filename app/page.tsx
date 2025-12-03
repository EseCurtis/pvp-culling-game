/* eslint-disable @typescript-eslint/ban-ts-comment */
import { auth, signIn, signOut } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { SearchableBattleReports } from "./_components/searchable-battle-reports";
import { Footer } from "./_components/footer";

export const metadata: Metadata = {
  title: "AI-Powered Jujutsu Kaisen Battle Simulator",
  description:
    "Create your sorcerer and engage in epic AI-driven battles. Challenge fighters, master techniques, create binding vows, and climb the leaderboard. Experience the Culling Game with real-time battles powered by advanced AI.",
  openGraph: {
    title: "The Culling Game - AI-Powered Jujutsu Kaisen Battle Simulator",
    description:
      "Create your sorcerer and engage in epic AI-driven battles. Challenge fighters, master techniques, and climb the leaderboard.",
    type: "website",
  },
};

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "The Culling Game",
            description:
              "AI-powered Jujutsu Kaisen battle simulator with real-time battles, XP economy, and character progression",
            url: process.env.NEXTAUTH_URL || "http://localhost:3000",
            applicationCategory: "Game",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            creator: {
              "@type": "Person",
              name: "Ese Curtis",
              url: "https://esecurtis.cv",
            },
          }),
        }}
      />
      <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <section className="rounded-3xl border border-[var(--border)] bg-black/60 p-6 backdrop-blur">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  The Culling Game
                </p>
                <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
                  AI-Powered Jujutsu Kaisen Battle Simulator
                </h1>
                <p className="mt-4 text-base text-white/90 md:text-lg">
                  Create your sorcerer and engage in epic battles powered by
                  advanced AI. Master cursed techniques, forge binding vows, and
                  dominate the leaderboard.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      AI Battles
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Real-time battles with intelligent AI judges
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      XP Economy
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Strategic resource management system
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Character Growth
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Evolve through battles and mastery
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Binding Vows
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Sacrifice for power like in JJK
                    </p>
                  </div>
                </div>
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

          {/* Creator Links Section */}
          <section className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  Created By
                </p>
                <h2 className="mt-3 text-2xl font-semibold">Ese Curtis</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Full-stack developer and creator of The Culling Game. Check
                  out my portfolio and other projects.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://esecurtis.cv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-[var(--border)] bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
                >
                  Portfolio →
                </a>
                <a
                  href="https://github.com/esecurtis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-[var(--border)] bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
                >
                  GitHub
                </a>
                <a
                  href="https://twitter.com/esecurtis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-[var(--border)] bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
                >
                  Twitter
                </a>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </>
  );
}
