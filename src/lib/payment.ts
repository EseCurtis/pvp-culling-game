/* eslint-disable @typescript-eslint/ban-ts-comment */
import Stripe from "stripe";
import {
  type PaymentProvider
} from "./payment.config";
import { prisma } from "./prisma";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    //@ts-ignore
      apiVersion: "2024-12-18.acacia",
    })
  : null;

/**
 * Create Stripe checkout session for XP purchase
 */
export async function createStripeCheckoutSession(
  userId: string,
  packageId: string,
  xpAmount: number,
  price: number
): Promise<{ sessionId: string; url: string }> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${xpAmount} XP`,
            description: "Culling Game XP Purchase",
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=cancelled`,
    metadata: {
      userId,
      packageId,
      xpAmount: xpAmount.toString(),
    },
  });

  return {
    sessionId: session.id,
    url: session.url || "",
  };
}

/**
 * Initialize Paystack transaction
 */
export async function initializePaystackTransaction(
  userId: string,
  packageId: string,
  xpAmount: number,
  price: number,
  email: string
): Promise<{ reference: string; authorizationUrl: string }> {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    throw new Error("Paystack is not configured");
  }

  // Convert price to Naira (or use USD if Paystack supports it)
  // For now, we'll use USD amount in cents
  const amountInCents = Math.round(price * 100);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountInCents,
      currency: "USD",
      metadata: {
        userId,
        packageId,
        xpAmount: xpAmount.toString(),
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/callback?provider=paystack`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to initialize Paystack transaction");
  }

  const data = await response.json();

  return {
    reference: data.data.reference,
    authorizationUrl: data.data.authorization_url,
  };
}

/**
 * Verify Paystack transaction
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<{ status: string; amount: number; metadata: Record<string, string> }> {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    throw new Error("Paystack is not configured");
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to verify Paystack transaction");
  }

  const data = await response.json();

  return {
    status: data.data.status,
    amount: data.data.amount / 100, // Convert from cents
    metadata: data.data.metadata || {},
  };
}

/**
 * Process successful payment and award XP
 */
export async function processSuccessfulPayment(
  userId: string,
  provider: PaymentProvider,
  transactionId: string,
  packageId: string,
  xpAmount: number,
  price: number
): Promise<void> {
  // Find and update existing pending purchase
  const existingPurchase = await prisma.xpPurchase.findFirst({
    where: {
      userId,
      transactionId,
      status: "PENDING",
    },
  });

  let xpPurchase;
  if (existingPurchase) {
    // Update existing purchase
    xpPurchase = await prisma.xpPurchase.update({
      where: { id: existingPurchase.id },
      data: {
        status: "COMPLETED",
      },
    });
  } else {
    // Create new purchase if not found (shouldn't happen normally)
    xpPurchase = await prisma.xpPurchase.create({
      data: {
        userId,
        amount: xpAmount,
        price,
        currency: "USD",
        provider,
        transactionId,
        status: "COMPLETED",
      },
    });
  }

  // Create or update payment transaction record
  await prisma.paymentTransaction.upsert({
    where: { xpPurchaseId: xpPurchase.id },
    update: {
      status: "COMPLETED",
    },
    create: {
      userId,
      xpPurchaseId: xpPurchase.id,
      amount: price,
      currency: "USD",
      provider,
      transactionId,
      status: "COMPLETED",
      metadata: {},
    },
  });

  // Award XP to user's character
  const character = await prisma.character.findUnique({
    where: { userId },
  });

  if (character) {
    await prisma.character.update({
      where: { id: character.id },
      data: {
        xp: { increment: xpAmount },
      },
    });
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

