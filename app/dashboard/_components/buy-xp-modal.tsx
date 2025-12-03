"use client";

import { businessLogicConfig } from "@/src/lib/business-logic.config";
import { getPackagePrice, getPaymentProvider, getXpPackages } from "@/src/lib/payment.config";
import { useState, useTransition } from "react";

type BuyXpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userCountry: string | null;
  currentXp: number;
};

export function BuyXpModal({
  isOpen,
  onClose,
  userCountry,
  currentXp,
}: BuyXpModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPackage, setSelectedPackage] = useState<string>("");

  if (!isOpen) return null;

  const provider = getPaymentProvider(userCountry);
  const packages = getXpPackages();
  const battleCost = businessLogicConfig.xp.battleCost;

  const handlePurchase = (packageId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/payment/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Failed to initiate payment");
          return;
        }

        // Redirect to payment provider
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        console.error("Purchase error:", error);
        alert("Failed to start purchase");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-black/90 p-6 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 transition hover:text-white"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Purchase XP</h2>
          <p className="mt-2 text-sm text-white/60">
            Your current XP: <span className="font-semibold text-white">{currentXp}</span>
          </p>
          <p className="mt-1 text-xs text-white/40">
            Battle cost: {battleCost} XP per challenge
          </p>
          {currentXp < battleCost && (
            <p className="mt-2 text-sm text-red-400">
              ⚠️ You need at least {battleCost} XP to challenge opponents
            </p>
          )}
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Payment Provider
          </p>
          <p className="mt-1 text-sm font-semibold">
            {provider === "PAYSTACK" ? "Paystack" : "Stripe"}
            {provider === "PAYSTACK" && (
              <span className="ml-2 text-xs text-white/60">
                (20% discount applied)
              </span>
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => {
            const price = getPackagePrice(pkg, provider);
            const isSelected = selectedPackage === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`rounded-xl border p-4 transition cursor-pointer ${
                  isSelected
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <div className="mb-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {pkg.name}
                  </p>
                  <p className="mt-1 text-2xl font-bold">{pkg.amount} XP</p>
                </div>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="text-lg font-semibold">${price.toFixed(2)}</p>
                  {provider === "PAYSTACK" && (
                    <p className="text-xs text-white/40 line-through">
                      ${pkg.priceStripe.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedPackage) {
                handlePurchase(selectedPackage);
              }
            }}
            disabled={!selectedPackage || isPending}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white hover:ring-1 hover:ring-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
}

