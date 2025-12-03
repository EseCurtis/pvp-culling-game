import { auth } from "@/src/lib/auth";
import {
  parseBindingVows,
  parseWeaknesses,
} from "@/src/lib/character";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BattleNowButton } from "./_components/battle-now-button";
import { BindingVowsListClient } from "./_components/binding-vows-list-client";
import { PaginatedBattleHistory } from "./_components/paginated-battle-history";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CharacterProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const character = await prisma.character.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      fightsAsCharacter1: {
        include: {
          winner: { select: { id: true, name: true } },
          loser: { select: { id: true, name: true } },
          character1: { select: { id: true, name: true } },
          character2: { select: { id: true, name: true } },
        },
        orderBy: { occurredAt: "desc" },
      },
      fightsAsCharacter2: {
        include: {
          winner: { select: { id: true, name: true } },
          loser: { select: { id: true, name: true } },
          character1: { select: { id: true, name: true } },
          character2: { select: { id: true, name: true } },
        },
        orderBy: { occurredAt: "desc" },
      },
    },
  });

  if (!character) {
    redirect("/");
  }

  const weaknesses = parseWeaknesses(character);
  const bindingVows = parseBindingVows(character);

  // Combine all fights with opponent info
  const allFights = [
    ...character.fightsAsCharacter1.map((fight) => {
      const opponent =
        fight.character1Id === character.id ? fight.character2 : fight.character1;
      return {
        ...fight,
        opponent: {
          id: opponent.id,
          name: opponent.name,
        },
        result: fight.winnerId === character.id ? "WIN" : "LOSS",
      };
    }),
    ...character.fightsAsCharacter2.map((fight) => {
      const opponent =
        fight.character2Id === character.id ? fight.character1 : fight.character2;
      return {
        ...fight,
        opponent: {
          id: opponent.id,
          name: opponent.name,
        },
        result: fight.winnerId === character.id ? "WIN" : "LOSS",
      };
    }),
  ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  // Check if user is logged in and viewing someone else's character
  const isOwnCharacter = session?.user?.id === character.user.id;
  const isLoggedIn = !!session?.user?.id;
  let userCharacter = null;
  if (isLoggedIn && !isOwnCharacter) {
    userCharacter = await prisma.character.findUnique({
      where: { userId: session.user?.id },
      select: { id: true, xp: true },
    });
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Character Hero Section */}
        <section className="rounded-3xl border border-white/10 bg-black/60 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.4em] text-white/30">
                Character Profile
              </p>
              <h1 className="mt-3 text-4xl font-semibold">{character.name}</h1>
              <p className="mt-2 text-sm text-white/60">{character.powerLevelEstimate}</p>
              <p className="mt-1 text-xs text-white/40">
                Created {new Date(character.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30">Grade</p>
                <p className="text-2xl font-semibold">{character.grade.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30">Record</p>
                <p className="text-2xl font-semibold">
                  {character.wins}W / {character.losses}L
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30">XP</p>
                <p className="text-2xl font-semibold">{character.xp || 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30">Rank</p>
                <p className="text-2xl font-semibold">#{character.ranking || 0}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Character Details Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Appearance & Personality */}
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Character Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Appearance
                </p>
                <p className="text-sm text-white/80 break-words">{character.appearance}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Personality
                </p>
                <p className="text-sm text-white/80 break-words">{character.personality}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Backstory
                </p>
                <p className="text-sm text-white/80 break-words">{character.backstory}</p>
              </div>
            </div>
          </div>

          {/* Power System */}
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Power System</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                 Curse Output
                </p>
                <p className="text-2xl font-semibold">{character.energyLevel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Power System
                </p>
                <p className="text-sm text-white/80 break-words">{character.powerSystem}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Techniques Section */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Cursed Techniques</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Cursed Technique
                </p>
                <p className="text-sm text-white/80 break-words">{character.cursedTechnique}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Innate Technique
                </p>
                <p className="text-sm text-white/80 break-words">{character.innateTechnique}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Maximum Technique
                </p>
                <p className="text-sm text-white/80 break-words">{character.maxTechnique}</p>
              </div>
              {character.reverseTechnique && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                    Reverse Cursed Technique
                  </p>
                  <p className="text-sm text-white/80 break-words">
                    {character.reverseTechnique}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Domain Expansion</h2>
            <div>
              <p className="text-sm text-white/80 break-words">{character.domainExpansion}</p>
            </div>
          </div>
        </section>

        {/* Weaknesses & Binding Vows */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Weakness Matrix</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <WeaknessList
                title="Technique Drawbacks"
                items={weaknesses.cursedTechniqueDrawbacks}
              />
              <WeaknessList title="Physical Limits" items={weaknesses.physicalLimitations} />
              <WeaknessList title="Personality Flaws" items={weaknesses.personalityFlaws} />
              <WeaknessList
                title="Battle Vulnerabilities"
                items={weaknesses.battleVulnerabilities}
              />
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Binding Vows</h2>
            {bindingVows.length === 0 ? (
              <p className="text-sm text-white/40">No binding vows recorded.</p>
            ) : (
              <BindingVowsListClient vows={bindingVows} />
            )}
          </div>
        </section>

        {/* Battle History */}
        <section className="rounded-3xl border border-white/10 bg-black/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Battle History</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-white/30">
              {allFights.length} battle{allFights.length !== 1 ? "s" : ""}
            </span>
          </div>
          <PaginatedBattleHistory fights={allFights} />
        </section>
      </div>

      {/* Floating Battle Button - Show if viewing someone else's character */}
      {!isOwnCharacter && (
        <BattleNowButton
          opponentId={character.id}
          opponentName={character.name}
          userXp={userCharacter?.xp ?? null}
          isLoggedIn={isLoggedIn}
        />
      )}
    </main>
  );
}

function WeaknessList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/30">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-white/80">
        {items.map((item) => (
          <li key={item} className="leading-relaxed break-words">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

