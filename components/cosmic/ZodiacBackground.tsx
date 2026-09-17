'use client';

import Image from 'next/image';

export function ZodiacBackground() {
  return (
    <div className="fixed inset-0 z-[-10] flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.15] mix-blend-screen">
      <div className="relative w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] lg:w-[80vw] lg:h-[80vw] max-w-[1200px] max-h-[1200px] animate-spin-slow">
        {/* Replace /zodiac-wheel.png with the actual filename of the uploaded image once you save it to the public folder */}
        <Image
          src="/zodiac-wheel.png"
          alt="Zodiac Wheel Background"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
