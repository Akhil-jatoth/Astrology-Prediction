'use client';

import Image from 'next/image';

export function ZodiacBackground() {
  return (
    <div className="fixed inset-0 z-[-10] flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.24] mix-blend-screen">
      <div className="relative w-[130vmax] h-[130vmax] min-w-[100vw] min-h-[100vh] animate-spin-slow">
        <Image
          src="/zodiac-wheel.png"
          alt="Zodiac Wheel Background"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
