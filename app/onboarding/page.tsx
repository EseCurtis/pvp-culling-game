import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { OnboardingModeSelector } from "./mode-selector";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const existing = await prisma.character.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-[var(--border)] bg-black/50 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Forge Your Culling Game Presence
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Build Your Jujutsu Sorcerer
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Choose how you want to create your character. You can generate one quickly with AI or build it step-by-step.
          </p>
        </div>

        <OnboardingModeSelector
          defaultName={session.user.name ?? session.user.email ?? "Sorcerer"}
        />
      </div>
    </main>
  );
}



