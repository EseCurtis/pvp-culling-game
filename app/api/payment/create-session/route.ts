import { NextRequest } from "next/server";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
  getPaymentProvider,
  getXpPackage,
  getPackagePrice,
} from "@/src/lib/payment.config";
import {
  createStripeCheckoutSession,
  initializePaystackTransaction,
} from "@/src/lib/payment";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { packageId } = body;

    if (!packageId || typeof packageId !== "string") {
      return Response.json(
        { error: "packageId is required" },
        { status: 400 }
      );
    }

    // Get user with country
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, country: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Determine payment provider
    const provider = getPaymentProvider(user.country);

    // Get XP package
    const xpPackage = getXpPackage(packageId);
    if (!xpPackage) {
      return Response.json({ error: "Invalid package" }, { status: 400 });
    }

    const price = getPackagePrice(xpPackage, provider);

    // Create payment session based on provider
    if (provider === "STRIPE") {
      const { sessionId, url } = await createStripeCheckoutSession(
        user.id,
        packageId,
        xpPackage.amount,
        price
      );

      // Create pending XP purchase record
      await prisma.xpPurchase.create({
        data: {
          userId: user.id,
          amount: xpPackage.amount,
          price,
          currency: "USD",
          provider: "STRIPE",
          transactionId: sessionId,
          status: "PENDING",
        },
      });

      return Response.json({ url, sessionId });
    } else {
      // Paystack
      if (!user.email) {
        return Response.json(
          { error: "Email required for Paystack payment" },
          { status: 400 }
        );
      }

      const { reference, authorizationUrl } =
        await initializePaystackTransaction(
          user.id,
          packageId,
          xpPackage.amount,
          price,
          user.email
        );

      // Create pending XP purchase record
      await prisma.xpPurchase.create({
        data: {
          userId: user.id,
          amount: xpPackage.amount,
          price,
          currency: "USD",
          provider: "PAYSTACK",
          transactionId: reference,
          status: "PENDING",
        },
      });

      return Response.json({ url: authorizationUrl, reference });
    }
  } catch (error) {
    console.error("Payment session creation failed", error);
    const errorMessage =
      error instanceof Error ? error.message : "Payment session creation failed";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}

