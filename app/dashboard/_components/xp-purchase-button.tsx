"use client";

import { useState } from "react";
import { BuyXpModal } from "./buy-xp-modal";

type XpPurchaseButtonProps = {
  userCountry: string | null;
  currentXp: number;
};

export function XpPurchaseButton({
  userCountry,
  currentXp,
}: XpPurchaseButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/20"
      >
        Buy XP
      </button>
      <BuyXpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userCountry={userCountry}
        currentXp={currentXp}
      />
    </>
  );
}

