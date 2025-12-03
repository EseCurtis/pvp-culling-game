import { auth } from "@/src/lib/auth";
import {
  parseBindingVows,
  parseWeaknesses,
} from "@/src/lib/character";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BattleNowButton } from "./_components/battle-now-button";
import { BindingVowsListClient } from "./_components/binding-vows-list-client";
import { PaginatedBattleHistory } from "./_components/paginated-battle-history";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const character = await prisma.character.findUnique({
    where: { id },
    select: {
      name: true,
      grade: true,
      wins: true,
      losses: true,
      ranking: true,
      energyLevel: true,
      powerLevelEstimate: true,
      appearance: true,
      personality: true,
      cursedTechnique: true,
      domainExpansion: true,
    },
  });

  if (!character) {
    return {
      title: "Character Not Found",
    };
  }

  const winRate =
    character.wins + character.losses > 0
      ? Math.round((character.wins / (character.wins + character.losses)) * 100)
      : 0;
  const description = `${character.name} - ${character.grade.replace("_", " ")} sorcerer with ${character.wins}W/${character.losses}L record (${winRate}% win rate). Cursed Energy: ${character.energyLevel}. ${character.powerLevelEstimate}. View full profile, battle history, techniques, and binding vows.`;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const characterUrl = `${baseUrl}/characters/${id}`;

  return {
    title: `${character.name} - ${character.grade.replace("_", " ")} Sorcerer Profile`,
    description,
    keywords: [
      character.name,
      "Jujutsu Kaisen",
      "JJK",
      character.grade.replace("_", " "),
      "sorcerer profile",
      "cursed technique",
      character.cursedTechnique?.substring(0, 50) || "",
      character.domainExpansion?.substring(0, 50) || "",
      "battle record",
      "character stats",
    ].filter(Boolean),
    openGraph: {
      title: `${character.name} - ${character.grade.replace("_", " ")} Sorcerer | The Culling Game`,
      description: `${character.name} is a ${character.grade.replace("_", " ")} sorcerer with ${character.wins} wins and ${character.losses} losses. Rank #${character.ranking || 0}.`,
      url: characterUrl,
      type: "profile",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${character.name} - Character Profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${character.name} - ${character.grade.replace("_", " ")} Sorcerer`,
      description: `${character.name}: ${character.wins}W/${character.losses}L | Rank #${character.ranking || 0} | ${character.powerLevelEstimate}`,
    },
    alternates: {
      canonical: characterUrl,
    },
  };
}

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

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const characterUrl = `${baseUrl}/characters/${id}`;
  const winRate =
    character.wins + character.losses > 0
      ? Math.round((character.wins / (character.wins + character.losses)) * 100)
      : 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: character.name,
            description: `${character.name} is a ${character.grade.replace("_", " ")} sorcerer in The Culling Game with ${character.wins} wins and ${character.losses} losses.`,
            url: characterUrl,
            identifier: characterUrl,
            jobTitle: `${character.grade.replace("_", " ")} Sorcerer`,
            knowsAbout: [
              "Cursed Energy",
              "Jujutsu Techniques",
              character.cursedTechnique?.substring(0, 50) || "Cursed Techniques",
              character.domainExpansion?.substring(0, 50) || "Domain Expansion",
            ].filter(Boolean),
            memberOf: {
              "@type": "Organization",
              name: "The Culling Game",
              url: baseUrl,
            },
            additionalProperty: [
              {
                "@type": "PropertyValue",
                name: "Grade",
                value: character.grade.replace("_", " "),
              },
              {
                "@type": "PropertyValue",
                name: "Wins",
                value: character.wins.toString(),
              },
              {
                "@type": "PropertyValue",
                name: "Losses",
                value: character.losses.toString(),
              },
              {
                "@type": "PropertyValue",
                name: "Ranking",
                value: (character.ranking || 0).toString(),
              },
              {
                "@type": "PropertyValue",
                name: "Cursed Energy Level",
                value: character.energyLevel.toString(),
              },
              {
                "@type": "PropertyValue",
                name: "Win Rate",
                value: `${winRate}%`,
              },
              {
                "@type": "PropertyValue",
                name: "Total Battles",
                value: (character.wins + character.losses).toString(),
              },
            ],
          }),
        }}
      />
      {allFights.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `${character.name}'s Battle History`,
              description: `Complete battle history for ${character.name} in The Culling Game`,
              numberOfItems: allFights.length,
              itemListElement: allFights.slice(0, 10).map((fight, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "Event",
                  name: `Battle: ${character.name} vs ${fight.opponent.name}`,
                  description: `${character.name} ${fight.result === "WIN" ? "defeated" : "lost to"} ${fight.opponent.name}`,
                  startDate: fight.occurredAt.toISOString(),
                  location: {
                    "@type": "Place",
                    name: "The Culling Game Arena",
                  },
                },
              })),
            }),
          }}
        />
      )}
      <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl flex flex-col gap-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-white/60 transition hover:text-white"
              aria-label="Home"
            >
              Home
            </Link>
            <span className="text-white/40">/</span>
            <Link
              href="/leaderboard"
              className="text-white/60 transition hover:text-white"
            >
              Leaderboard
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white" aria-current="page">
              {character.name}
            </span>
          </nav>

        {/* Character Hero Section */}
        <article className="rounded-3xl border border-white/10 bg-black/60 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <header className="flex-1">
              <p className="text-xs uppercase tracking-[0.4em] text-white/30">
                Character Profile
              </p>
              <h1 className="mt-3 text-4xl font-semibold">{character.name}</h1>
              <p className="mt-2 text-sm text-white/60">
                {character.powerLevelEstimate}
              </p>
              <p className="mt-1 text-xs text-white/40">
                Created{" "}
                <time dateTime={character.createdAt.toISOString()}>
                  {new Date(character.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </p>
            </header>
            <dl className="flex gap-6 text-center">
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-white/30">Grade</dt>
                <dd className="text-2xl font-semibold">{character.grade.replace("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-white/30">Record</dt>
                <dd className="text-2xl font-semibold">
                  {character.wins}W / {character.losses}L
                  {character.wins + character.losses > 0 && (
                    <span className="ml-2 text-sm text-white/60">({winRate}%)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-white/30">XP</dt>
                <dd className="text-2xl font-semibold">{character.xp || 0}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-white/30">Rank</dt>
                <dd className="text-2xl font-semibold">#{character.ranking || 0}</dd>
              </div>
            </dl>
          </div>
        </article>

        {/* Character Details Grid */}
        <section className="grid gap-6 md:grid-cols-3" aria-label="Character Information">
          {/* Appearance & Personality */}
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Character Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Appearance
                </h3>
                <p className="text-sm text-white/80 break-words">{character.appearance}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Personality
                </h3>
                <p className="text-sm text-white/80 break-words">{character.personality}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  Backstory
                </h3>
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
        <section className="rounded-3xl border border-white/10 bg-black/50 p-6" aria-label="Battle History">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Battle History</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-white/30" aria-label={`Total battles: ${allFights.length}`}>
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
    </>
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

