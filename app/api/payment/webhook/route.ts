import { NextRequest } from "next/server";
import { verifyStripeWebhook, processSuccessfulPayment } from "@/src/lib/payment";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "No signature" }, { status: 400 });
  }

  try {
    const body = await request.text();
    const event = verifyStripeWebhook(body, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        id: string;
        metadata?: {
          userId?: string;
          packageId?: string;
          xpAmount?: string;
        };
      };

      const userId = session.metadata?.userId;
      const packageId = session.metadata?.packageId;
      const xpAmount = session.metadata?.xpAmount
        ? parseInt(session.metadata.xpAmount)
        : null;

      if (!userId || !packageId || !xpAmount) {
        return Response.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      // Find the pending purchase
      const purchase = await prisma.xpPurchase.findFirst({
        where: {
          userId,
          transactionId: session.id,
          status: "PENDING",
        },
      });

      if (!purchase) {
        return Response.json({ error: "Purchase not found" }, { status: 404 });
      }

      // Process successful payment
      await processSuccessfulPayment(
        userId,
        "STRIPE",
        session.id,
        packageId,
        xpAmount,
        purchase.price
      );

      return Response.json({ received: true });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return Response.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

