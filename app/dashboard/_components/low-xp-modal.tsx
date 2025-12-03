"use client";

import { useEffect, useState } from "react";
import { BuyXpModal } from "./buy-xp-modal";
import { businessLogicConfig } from "@/src/lib/business-logic.config";

type LowXpModalProps = {
  userCountry: string | null;
  currentXp: number;
};

export function LowXpModal({ userCountry, currentXp }: LowXpModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const battleCost = businessLogicConfig.xp.battleCost;

  useEffect(() => {
    // Show modal if XP is below battle cost
    if (currentXp < battleCost) {
      setIsOpen(true);
    }
  }, [currentXp, battleCost]);

  return (
    <BuyXpModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      userCountry={userCountry}
      currentXp={currentXp}
    />
  );
}

