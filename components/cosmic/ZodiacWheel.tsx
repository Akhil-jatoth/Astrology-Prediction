'use client';

import dynamic from 'next/dynamic';
import { ZODIAC_SIGNS, ZODIAC_DATA } from '@/lib/constants';

const ZodiacWheel3D = dynamic(() => import('./ZodiacWheel3D').then((m) => m.ZodiacWheel3D), {
  ssr: false,
  loading: () => <ZodiacWheelFallback />,
});

function ZodiacWheelFallback() {
  return (
    <div
      className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-full border border-white/10 bg-secondary/30 md:h-96 md:w-96"
      aria-hidden="true"
    >
      <div className="absolute inset-4 rounded-full border border-accent-purple/30" />
      <div className="absolute inset-12 rounded-full border border-accent-blue/20" />
      <span className="font-display text-4xl text-gold">✦</span>
    </div>
  );
}

interface ZodiacWheelProps {
  interactive?: boolean;
  onSelectSign?: (sign: string) => void;
  selectedSign?: string | null;
}

export function ZodiacWheel({ interactive, onSelectSign, selectedSign }: ZodiacWheelProps) {
  return (
    <div className="relative">
      <ZodiacWheel3D
        interactive={interactive}
        onSelectSign={onSelectSign}
        selectedSign={selectedSign}
      />
      {interactive && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 md:hidden">
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign}
              type="button"
              onClick={() => onSelectSign?.(sign)}
              className={`rounded-pill px-3 py-1 text-xs transition-colors ${
                selectedSign === sign
                  ? 'bg-accent-purple text-white'
                  : 'bg-secondary/60 text-silver hover:text-white'
              }`}
              aria-label={`Select ${ZODIAC_DATA[sign].name}`}
            >
              {ZODIAC_DATA[sign].symbol}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
