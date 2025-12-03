/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseBattleSummary } from "@/src/lib/character";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

// type Props = {
//   params: { id: string };
// };

export default async function FightSummaryPage({ params }: any) {
  const fight = await prisma.fightResult.findUnique({
    where: { id: params.id },
    include: {
      winner: {
        select: {
          id: true,
          name: true,
          grade: true,
          wins: true,
          losses: true
        }
      },
      loser: {
        select: {
          id: true,
          name: true,
          grade: true,
          wins: true,
          losses: true
        }
      },
      character1: {
        select: { id: true, name: true }
      },
      character2: {
        select: { id: true, name: true }
      }
    }
  });

  if (!fight) {
    notFound();
  }

  const summary = parseBattleSummary(fight.summaryPayload);

  // Determine winner status based on winnerId (more reliable than comparing objects)
  const isFighter1Winner = fight.character1Id === fight.winnerId;
  const fighter1Data = isFighter1Winner ? fight.winner : fight.loser;
  const fighter2Data = isFighter1Winner ? fight.loser : fight.winner;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-white"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] transition hover:text-white"
          >
            Arena Home
          </Link>
        </div>

        {/* Header */}
        <div className="rounded-3xl border border-[var(--border)] bg-black/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Battle Report
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            {summary.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {new Date(fight.occurredAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>

        {/* Fighter Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <FighterCard 
            fighter={{...fighter1Data, id: fight.character1Id}} 
            isWinner={isFighter1Winner} 
          />
          <FighterCard 
            fighter={{...fighter2Data, id: fight.character2Id}} 
            isWinner={!isFighter1Winner} 
          />
        </div>

        {/* Opening */}
        <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
          <p className="text-base leading-relaxed text-white/90">
            {summary.opening}
          </p>
        </div>

        {/* Key Highlights Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard
            title="Techniques Deployed"
            items={summary.techniquesUsed}
          />
          <SectionCard
            title="Weaknesses Exploited"
            items={summary.weaknessesExploited}
          />
        </div>

        {/* Domain Moments */}
        {summary.domainMoments && summary.domainMoments.length > 0 && (
          <SectionCard title="Domain Moments" items={summary.domainMoments} />
        )}

        {/* Turning Points */}
        <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
          <h2 className="mb-4 text-lg font-semibold">Turning Points</h2>
          <ul className="space-y-3">
            {summary.turningPoints.map((point, index) => (
              <li key={index} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/80">
                  {index + 1}
                </span>
                <span className="text-white/90">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Final Blow & Victory */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
            <h2 className="mb-3 text-lg font-semibold">Final Blow</h2>
            <p className="text-white/90">{summary.finalBlow}</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
            <h2 className="mb-3 text-lg font-semibold">Victory Reason</h2>
            <p className="text-white/90">{summary.reasonForVictory}</p>
          </div>
        </div>

        {/* Injuries */}
        {summary.injuries && summary.injuries.length > 0 && (
          <SectionCard title="Injuries Sustained" items={summary.injuries} />
        )}

        {/* Full Narrative */}
        <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
          <h2 className="mb-4 text-lg font-semibold">Full Battle Narrative</h2>
          <div className="prose prose-invert max-w-none">
            <p className="leading-relaxed text-white/90 whitespace-pre-line">
              {summary.narrative}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 rounded-xl border border-[var(--border)] bg-black/40 px-6 py-3 text-center text-sm font-semibold transition hover:border-white/30 hover:bg-black/60"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-xl bg-white px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] !text-black transition hover:bg-transparent hover:text-white hover:ring-1 hover:ring-white"
          >
            View More Battles
          </Link>
        </div>
      </div>
    </main>
  );
}

function FighterCard({
  fighter,
  isWinner
}: {
  fighter: { id: string; name: string; grade: string; wins: number; losses: number };
  isWinner: boolean;
}) {
  return (
    <Link
      href={`/characters/${fighter.id}`}
      className={`block rounded-2xl border p-5 transition hover:border-white/30 ${
        isWinner ? "border-white/30 bg-white/5" : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold break-words">{fighter.name}</h3>
            {isWinner && (
              <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/80 uppercase tracking-[0.1em] shrink-0">
                Winner
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {fighter.grade.replace("_", " ")}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Record: {fighter.wins}W / {fighter.losses}L
          </p>
        </div>
      </div>
    </Link>
  );
}

function SectionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="text-[var(--muted)]">•</span>
            <span className="text-white/90">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
