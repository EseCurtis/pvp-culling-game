import { NextRequest } from "next/server";
import { verifyPaystackTransaction, processSuccessfulPayment } from "@/src/lib/payment";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider");
  const reference = searchParams.get("reference");

  if (provider !== "paystack" || !reference) {
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=error`
    );
  }

  try {
    // Verify Paystack transaction
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== "success") {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=failed`
      );
    }

    const userId = verification.metadata.userId;
    const packageId = verification.metadata.packageId;
    const xpAmount = verification.metadata.xpAmount
      ? parseInt(verification.metadata.xpAmount)
      : null;

    if (!userId || !packageId || !xpAmount) {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=error`
      );
    }

    // Find the pending purchase
    const purchase = await prisma.xpPurchase.findFirst({
      where: {
        userId,
        transactionId: reference,
        status: "PENDING",
      },
    });

    if (!purchase) {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=error`
      );
    }

    // Process successful payment
    await processSuccessfulPayment(
      userId,
      "PAYSTACK",
      reference,
      packageId,
      xpAmount,
      purchase.price
    );

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=success`
    );
  } catch (error) {
    console.error("Paystack callback error", error);
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=error`
    );
  }
}

