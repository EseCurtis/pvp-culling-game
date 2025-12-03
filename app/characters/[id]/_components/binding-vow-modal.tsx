"use client";

type BindingVow = {
  name: string;
  sacrifice: string;
  enhancements: string[];
  conditions: string[];
  limitations: string[];
  sideEffects: string[];
};

type BindingVowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vow: BindingVow;
};

export function BindingVowModal({ isOpen, onClose, vow }: BindingVowModalProps) {
  if (!isOpen) return null;

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
          <h2 className="text-2xl font-semibold">{vow.name}</h2>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">
            Binding Vow Details
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
              Sacrifice
            </p>
            <p className="text-sm text-white/80 break-words">{vow.sacrifice}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
              Enhancements
            </p>
            <ul className="space-y-1">
              {vow.enhancements.map((enhancement, idx) => (
                <li key={idx} className="text-sm text-white/80 break-words">
                  • {enhancement}
                </li>
              ))}
            </ul>
          </div>

          {vow.conditions.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                Conditions
              </p>
              <ul className="space-y-1">
                {vow.conditions.map((condition, idx) => (
                  <li key={idx} className="text-sm text-white/80 break-words">
                    • {condition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {vow.limitations.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                Limitations
              </p>
              <ul className="space-y-1">
                {vow.limitations.map((limitation, idx) => (
                  <li key={idx} className="text-sm text-white/80 break-words">
                    • {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {vow.sideEffects.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                Side Effects
              </p>
              <ul className="space-y-1">
                {vow.sideEffects.map((sideEffect, idx) => (
                  <li key={idx} className="text-sm text-white/80 break-words">
                    • {sideEffect}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

