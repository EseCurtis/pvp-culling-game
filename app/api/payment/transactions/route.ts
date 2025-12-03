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
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    const [transactions, total] = await Promise.all([
      prisma.xpPurchase.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip,
        select: {
          id: true,
          amount: true,
          price: true,
          provider: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.xpPurchase.count({
        where: { userId: session.user.id },
      }),
    ]);

    return Response.json({
      transactions,
      hasMore: skip + transactions.length < total,
      total,
    });
  } catch (error) {
    console.error("Failed to fetch transactions", error);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

