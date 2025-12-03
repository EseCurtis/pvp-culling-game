/**
 * Payment Configuration
 * 
 * Centralized configuration for payment providers, XP packages, and pricing.
 */

export type PaymentProvider = "STRIPE" | "PAYSTACK";

export type XpPackage = {
  id: string;
  name: string;
  amount: number; // XP amount
  priceStripe: number; // Price in USD for Stripe
  pricePaystack: number; // Price in USD for Paystack (20% cheaper)
};

/**
 * African countries that should use Paystack
 * Paystack supports: Nigeria, Ghana, Kenya, South Africa, and others
 */
export const PAYSTACK_COUNTRIES = [
  "NG", // Nigeria
  "GH", // Ghana
  "KE", // Kenya
  "ZA", // South Africa
  "UG", // Uganda
  "TZ", // Tanzania
  "RW", // Rwanda
  "ZM", // Zambia
  "ZW", // Zimbabwe
  "SL", // Sierra Leone
  "GM", // Gambia
  "SN", // Senegal
  "CI", // Côte d'Ivoire
  "CM", // Cameroon
  "GH", // Ghana
];

/**
 * XP Packages available for purchase
 */
export const XP_PACKAGES: XpPackage[] = [
  {
    id: "small",
    name: "Small Pack",
    amount: 100,
    priceStripe: 2.99,
    pricePaystack: 2.39, // 20% cheaper
  },
  {
    id: "medium",
    name: "Medium Pack",
    amount: 250,
    priceStripe: 6.99,
    pricePaystack: 5.59, // 20% cheaper
  },
  {
    id: "large",
    name: "Large Pack",
    amount: 500,
    priceStripe: 12.99,
    pricePaystack: 10.39, // 20% cheaper
  },
];

/**
 * Determine payment provider based on country
 * Falls back to Paystack if Stripe is not configured
 */
export function getPaymentProvider(
  country: string | null | undefined
): PaymentProvider {
  // Check if Stripe is configured
  const stripeConfigured =
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY;

  // If Stripe not configured, use Paystack
  if (!stripeConfigured) {
    return "PAYSTACK";
  }

  // If no country provided, default to Stripe
  if (!country) {
    return "STRIPE";
  }

  // Check if country is in Paystack-supported list
  const countryCode = country.toUpperCase();
  if (PAYSTACK_COUNTRIES.includes(countryCode)) {
    return "PAYSTACK";
  }

  // Default to Stripe for other countries
  return "STRIPE";
}

/**
 * Get XP packages for a specific provider
 */
export function getXpPackages(): XpPackage[] {
  return XP_PACKAGES;
}

/**
 * Get price for a package based on provider
 */
export function getPackagePrice(
  pkg: XpPackage,
  provider: PaymentProvider
): number {
  return provider === "PAYSTACK" ? pkg.pricePaystack : pkg.priceStripe;
}

/**
 * Get a specific XP package by ID
 */
export function getXpPackage(packageId: string): XpPackage | undefined {
  return XP_PACKAGES.find((p) => p.id === packageId);
}

