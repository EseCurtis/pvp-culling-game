"use client";

import type { FightResult } from "@prisma/client";
import Link from "next/link";
import { useMemo } from "react";

type TournamentTreeProps = {
  fights: Array<
    FightResult & {
      character1Id: string;
      character2Id: string;
      round: number;
      winner: { id: string; name: string };
      loser: { id: string; name: string };
    }
  >;
};

type MatchNode = {
  fight: TournamentTreeProps["fights"][0];
  round: number;
  winnerId: string;
  winnerName: string;
  participant1: { id: string; name: string; isWinner: boolean };
  participant2: { id: string; name: string; isWinner: boolean };
};

function groupFightsByTournament(fights: TournamentTreeProps["fights"]) {
  const tournaments = new Map<string, typeof fights>();

  fights.forEach((fight) => {
    const dateKey = new Date(fight.occurredAt).toDateString();
    if (!tournaments.has(dateKey)) {
      tournaments.set(dateKey, []);
    }
    tournaments.get(dateKey)!.push(fight);
  });

  return Array.from(tournaments.entries()).map(([date, tournamentFights]) => ({
    date,
    fights: tournamentFights.sort(
      (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
    ),
  }));
}

function buildBracketRounds(
  fights: TournamentTreeProps["fights"]
): MatchNode[][] {
  if (fights.length === 0) return [];

  // Group fights by round
  const roundsMap = new Map<number, MatchNode[]>();

  fights.forEach((fight) => {
    const match: MatchNode = {
      fight,
      round: fight.round,
      winnerId: fight.winner.id,
      winnerName: fight.winner.name,
      participant1: {
        id: fight.character1Id,
        name:
          fight.character1Id === fight.winner.id
            ? fight.winner.name
            : fight.loser.name,
        isWinner: fight.character1Id === fight.winner.id,
      },
      participant2: {
        id: fight.character2Id,
        name:
          fight.character2Id === fight.winner.id
            ? fight.winner.name
            : fight.loser.name,
        isWinner: fight.character2Id === fight.winner.id,
      },
    };

    if (!roundsMap.has(fight.round)) {
      roundsMap.set(fight.round, []);
    }
    roundsMap.get(fight.round)!.push(match);
  });

  // Sort rounds and return as array
  return Array.from(roundsMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, matches]) => matches);
}

function MatchCard({
  match,
  isFinal,
}: {
  match: MatchNode;
  isFinal: boolean;
}) {
  return (
    <div className="group relative block min-w-[220px]">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10">
        <div className="space-y-2">
          {/* Participant 1 */}
          <div
            className={`rounded border px-3 py-2.5 text-sm transition ${
              match.participant1.isWinner
                ? "border-white/30 bg-white/10 font-semibold text-white"
                : "border-white/5 bg-white/0 text-white/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/characters/${match.participant1.id}`}
                className="truncate break-words hover:underline transition"
                onClick={(e) => e.stopPropagation()}
              >
                {match.participant1.name}
              </Link>
              {match.participant1.isWinner && (
                <span className="ml-2 shrink-0 text-xs font-bold">✓</span>
              )}
            </div>
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs uppercase tracking-wider text-white/30">
              vs
            </span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          {/* Participant 2 */}
          <div
            className={`rounded border px-3 py-2.5 text-sm transition ${
              match.participant2.isWinner
                ? "border-white/30 bg-white/10 font-semibold text-white"
                : "border-white/5 bg-white/0 text-white/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/characters/${match.participant2.id}`}
                className="truncate break-words hover:underline transition"
                onClick={(e) => e.stopPropagation()}
              >
                {match.participant2.name}
              </Link>
              {match.participant2.isWinner && (
                <span className="ml-2 shrink-0 text-xs font-bold">✓</span>
              )}
            </div>
          </div>

          {/* Winner highlight for final */}
          {isFinal && (
            <div className="mt-3 rounded border border-white/20 bg-white/5 px-3 py-2 text-center">
              <Link
                href={`/characters/${match.winnerId}`}
                className="text-xs font-semibold uppercase tracking-wider text-white/80 break-words hover:underline transition block"
                onClick={(e) => e.stopPropagation()}
              >
                Champion: {match.winnerName}
              </Link>
            </div>
          )}
        </div>
        <Link
          href={`/fights/${match.fight.id}`}
          className="absolute inset-0"
          aria-label={`View fight details`}
        />
      </div>
    </div>
  );
}

export function TournamentTree({ fights }: TournamentTreeProps) {
  const tournaments = useMemo(() => groupFightsByTournament(fights), [fights]);
  const latestTournament = tournaments[tournaments.length - 1];

  const rounds = useMemo(() => {
    if (!latestTournament || latestTournament.fights.length === 0) {
      return [];
    }
    return buildBracketRounds(latestTournament.fights);
  }, [latestTournament]);

  if (!latestTournament || latestTournament.fights.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-black/50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tournament Bracket</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-white/30">
            Latest cycle progression
          </span>
        </div>
        <p className="mt-4 py-6 text-sm text-white/40">
          Tournament brackets will appear here once battles begin.
        </p>
      </section>
    );
  }

 

  return (
    <section className="rounded-3xl border border-white/10 bg-black/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Tournament Bracket</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/30">
            {new Date(latestTournament.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-white/30">
          {latestTournament.fights.length} battle
          {latestTournament.fights.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Bracket Container */}
      <div className="overflow-x-auto pb-4">
        <div className="relative flex min-w-max gap-16">
          {rounds.map((round, roundIndex) => {
            const isFinal = roundIndex === rounds.length - 1;
            const roundNumber = roundIndex + 1;

            return (
              <div key={roundIndex} className="relative flex flex-col">
                {/* Round Header */}
                <div className="mb-6 text-center">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">
                    {isFinal
                      ? "Final"
                      : roundNumber === 1
                        ? "Round 1"
                        : `Round ${roundNumber}`}
                  </h3>
                  <p className="mt-1 text-xs text-white/20">
                    {round.length} match{round.length !== 1 ? "es" : ""}
                  </p>
                </div>

                {/* Matches Container */}
                <div className="relative flex flex-col gap-16">
                  {round.map((match) => {
                    return (
                      <div key={match.fight.id} className="relative">
                        <MatchCard match={match} isFinal={isFinal} />

                        {/* Connection line to next round */}
                        {!isFinal && (
                          <div className="absolute right-0 top-1/2 h-px w-16 -translate-y-1/2 bg-white/20"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Previous Tournaments */}
      {tournaments.length > 1 && (
        <div className="mt-8 border-t border-white/5 pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/30">
            Previous Tournaments
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tournaments
              .slice(0, -1)
              .reverse()
              .map((tournament) => (
                <button
                  key={tournament.date}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 transition hover:border-white/20 hover:bg-white/10 hover:text-white/60"
                >
                  {new Date(tournament.date).toLocaleDateString()} (
                  {tournament.fights.length})
                </button>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
