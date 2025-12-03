import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { executeFight } from "@/src/lib/fight";
import { prisma } from "@/src/lib/prisma";
import { businessLogicConfig } from "@/src/lib/business-logic.config";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { opponentId } = body;

    if (!opponentId || typeof opponentId !== "string") {
      return Response.json(
        { error: "opponentId is required" },
        { status: 400 }
      );
    }

    // Get user's character
    const userCharacter = await prisma.character.findUnique({
      where: { userId: session.user.id },
    });

    if (!userCharacter) {
      return Response.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Check if challenger has enough XP before initiating fight
    const battleCost = businessLogicConfig.xp.battleCost;
    if (userCharacter.xp < battleCost) {
      return Response.json(
        {
          error: `Insufficient XP. You need ${battleCost} XP to challenge, but you only have ${userCharacter.xp} XP.`,
        },
        { status: 400 }
      );
    }

    // Execute the fight
    const fight = await executeFight(userCharacter.id, opponentId);

    revalidatePath("/dashboard");
    revalidatePath("/");

    return Response.json({
      ok: true,
      fightId: fight.id,
      winnerId: fight.winnerId,
    });
  } catch (error) {
    console.error("Fight execution failed", error);
    const errorMessage =
      error instanceof Error ? error.message : "Fight execution failed";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}

