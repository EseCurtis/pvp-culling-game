import { NextRequest } from "next/server";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  try {
    // Get user's character
    const userCharacter = await prisma.character.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!userCharacter) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    // Build where clause
    const where: {
      id: { not: string };
      name?: { contains: string; mode: "insensitive" };
    } = {
      id: { not: userCharacter.id },
    };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [opponents, total] = await Promise.all([
      prisma.character.findMany({
        where,
        select: {
          id: true,
          name: true,
          grade: true,
          wins: true,
          losses: true,
          ranking: true,
          xp: true,
        },
        orderBy: [
          { ranking: "asc" },
          { wins: "desc" },
          { losses: "asc" },
        ],
        take: pageSize,
        skip,
      }),
      prisma.character.count({ where }),
    ]);

    return Response.json({
      opponents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: skip + opponents.length < total,
      },
    });
  } catch (error) {
    console.error("Failed to fetch opponents", error);
    return Response.json(
      { error: "Failed to fetch opponents" },
      { status: 500 }
    );
  }
}

