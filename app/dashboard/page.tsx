import { auth } from "@/src/lib/auth";
import { businessLogicConfig } from "@/src/lib/business-logic.config";
import {
  getUserCharacter,
  parseBattleSummary,
  parseBindingVows,
  parseWeaknesses,
} from "@/src/lib/character";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BindingVowForm } from "./_components/binding-vow-form";
import { CharacterEvolutionForm } from "./_components/character-evolution-form";
import { PaginatedOpponentSelector } from "./_components/paginated-opponent-selector";
import { LowXpModal } from "./_components/low-xp-modal";
import { TransactionHistory } from "./_components/transaction-history";
import { XpPurchaseButton } from "./_components/xp-purchase-button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const character = await getUserCharacter(session.user.id);
  if (!character) {
    redirect("/onboarding");
  }

  // Get user with country
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { country: true },
  });

  const weaknesses = parseWeaknesses(character);
  const bindingVows = parseBindingVows(character);

  const fights = [
    ...character.fightsAsWinner.map((fight) => ({
      id: fight.id,
      opponent: fight.loser.name,
      opponentId: fight.loser.id,
      result: "WIN" as const,
      occurredAt: fight.occurredAt,
      summaryPayload: fight.summaryPayload,
    })),
    ...character.fightsAsLoser.map((fight) => ({
      id: fight.id,
      opponent: fight.winner.name,
      opponentId: fight.winner.id,
      result: "LOSS" as const,
      occurredAt: fight.occurredAt,
      summaryPayload: fight.summaryPayload,
    })),
  ].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Hero Section */}
        <section className="rounded-3xl border border-[var(--border)] bg-black/60 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                Your Fighter
              </p>
              <h1 className="mt-3 text-4xl font-semibold">{character.name}</h1>
              <p className="text-sm text-[var(--muted)]">{character.powerLevelEstimate}</p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Grade</p>
                <p className="text-2xl font-semibold">{character.grade.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Record</p>
                <p className="text-2xl font-semibold">
                  {character.wins}W / {character.losses}L
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">XP</p>
                <p className="text-2xl font-semibold">{character.xp || 0}</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Battle cost: {businessLogicConfig.xp.battleCost} XP
                </p>
                <div className="mt-2">
                  <XpPurchaseButton
                    userCountry={user?.country ?? null}
                    currentXp={character.xp}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Rank</p>
                <p className="text-2xl font-semibold">#{character.ranking || 0}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
              Weakness Matrix
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <WeaknessList title="Technique Drawbacks" items={weaknesses.cursedTechniqueDrawbacks} />
              <WeaknessList title="Physical Limits" items={weaknesses.physicalLimitations} />
              <WeaknessList title="Personality Flaws" items={weaknesses.personalityFlaws} />
              <WeaknessList title="Battle Vulnerabilities" items={weaknesses.battleVulnerabilities} />
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
              Binding Vows
            </p>
            {bindingVows.length === 0 && (
              <p className="mt-3 text-sm text-[var(--muted)]">
                No vows recorded yet. Forge one below.
              </p>
            )}
            <div className="mt-4 space-y-4">
              {bindingVows.map((vow) => (
                <div
                  key={vow.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    {vow.name}
                  </p>
                  <p className="mt-2 text-sm">Sacrifice: {vow.sacrifice}</p>
                  <p className="text-sm text-[var(--muted)]">
                    Enhancements: {vow.enhancements?.join(", ")}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Conditions: {vow.conditions?.join(", ")}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Limitations: {vow.limitations?.join(", ")}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Side Effects: {vow.sideEffects?.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <PaginatedOpponentSelector
            userCharacterId={character.id}
            userXp={character.xp}
          />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-[var(--muted)]">
              💡 <strong>XP System:</strong> To challenge an opponent, you pay {businessLogicConfig.xp.battleCost} XP which is transferred to them. 
              If you win, you receive {businessLogicConfig.xp.winReward} XP as a reward. 
              When others challenge you, you receive their {businessLogicConfig.xp.battleCost} XP payment, and if you win, you also get {businessLogicConfig.xp.winReward} XP bonus.
            </p>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <CharacterEvolutionForm
            context={{
              appearance: character.appearance,
              personality: character.personality,
              backstory: character.backstory,
              powerSystem: character.powerSystem,
              cursedTechnique: character.cursedTechnique,
              innateTechnique: character.innateTechnique,
              maxTechnique: character.maxTechnique,
              domainExpansion: character.domainExpansion,
              reverseTechnique: character.reverseTechnique,
              energyLevel: character.energyLevel,
              powerLevelEstimate: character.powerLevelEstimate,
            }}
          />
          <BindingVowForm existingCount={bindingVows.length} />
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-black/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Battle History</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Recent fights & summaries
            </span>
          </div>
          <div className="mt-4 divide-y divide-white/5">
            {fights.length === 0 && (
              <p className="py-6 text-sm text-[var(--muted)]">
                No battles yet. Challenge a fighter above to start your journey!
              </p>
            )}
            {fights.map((fight) => {
              const summary = parseBattleSummary(fight.summaryPayload);
              return (
                <div
                  key={fight.id}
                  className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      {fight.result} vs{" "}
                      <Link
                        href={`/characters/${fight.opponentId}`}
                        className="text-white/80 hover:text-white transition underline"
                      >
                        {fight.opponent}
                      </Link>
                    </p>
                    <p className="text-base font-semibold break-words">{summary.title}</p>
                    <p className="text-sm text-[var(--muted)] break-words">
                      {summary.opening}
                    </p>
                  </div>
                  <Link
                    href={`/fights/${fight.id}`}
                    className="text-xs uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
                  >
                    Read Summary →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <TransactionHistory userId={session.user.id} />

        <LowXpModal userCountry={user?.country ?? null} currentXp={character.xp} />
      </div>
    </main>
  );
}

function WeaknessList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-white/80">
        {items.map((item) => (
          <li key={item} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}


