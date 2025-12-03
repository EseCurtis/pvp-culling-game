"use client";

import { smartTruncate } from "@/src/lib/text-utils";
import { useState } from "react";
import { BindingVowModal } from "./binding-vow-modal";

type BindingVow = {
  name: string;
  sacrifice: string;
  enhancements: string[];
  conditions: string[];
  limitations: string[];
  sideEffects: string[];
};

type BindingVowsListClientProps = {
  vows: BindingVow[];
};

export function BindingVowsListClient({ vows }: BindingVowsListClientProps) {
  const [selectedVow, setSelectedVow] = useState<BindingVow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVowClick = (vow: BindingVow) => {
    setSelectedVow(vow);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {vows.map((vow) => {

          if(!vow) return null
          
          const sacrificeText = smartTruncate(vow.sacrifice, 80);
          const enhancementsText = vow.enhancements?.join(", ");
          const truncatedEnhancements = smartTruncate(enhancementsText, 100);

          return (
            <button
              key={vow.name}
              onClick={() => handleVowClick(vow)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/20 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/30">
                {vow.name}
              </p>
              <p className="mt-2 text-sm break-words">
                Sacrifice: {sacrificeText}
                {vow.sacrifice.length > 80 && "…"}
              </p>
              <p className="mt-1 text-sm text-white/60 break-words">
                Enhancements: {truncatedEnhancements}
                {enhancementsText?.length > 100 && "…"}
              </p>
              <p className="mt-2 text-xs text-white/40">Click to view full details →</p>
            </button>
          );
        })}
      </div>

      {selectedVow && (
        <BindingVowModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVow(null);
          }}
          vow={selectedVow}
        />
      )}
    </>
  );
}

