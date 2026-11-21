'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ZodiacWheel } from '@/components/cosmic/ZodiacWheel';
import { ZODIAC_SIGNS, ZODIAC_DATA } from '@/lib/constants';

export function Hero() {
  // Prevent whole-page scrolling on the home page
  useEffect(() => {
    const preventScroll = (e: WheelEvent | TouchEvent) => {
      // Allow scroll only inside designated scroll containers if any
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('.allow-scroll')) return;
      e.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    // Also lock document body overflow
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <section className="relative flex h-[100dvh] w-full flex-col justify-between overflow-hidden px-4 pb-3 pt-20 sm:px-6 lg:px-8 select-none">
      {/* Main Content Area: Fits perfectly in viewport */}
      <div className="mx-auto my-auto flex w-full max-w-7xl flex-1 items-center">
        <div className="grid w-full items-center gap-6 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: Editorial Headline, CTAs, Zodiac Quick Access */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10 text-center lg:col-span-7 lg:text-left"
          >
            {/* Pill */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 backdrop-blur-md">
              <span className="text-xs text-gold">✦</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
                Astrological Ephemeris & Celestial Observatory
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover Your Destiny Through the{' '}
              <span className="bg-gradient-to-r from-gold via-amber-200 to-accent-blue bg-clip-text text-transparent">
                Stars
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mb-5 max-w-xl text-sm leading-relaxed text-silver/85 sm:text-base lg:mx-0">
              High-precision astronomical ephemerides meet timeless archetypal astrology. Calculate natal geometry, 
              track real-time planetary transits, and explore the wisdom of the celestial spheres.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button
                href="/chart/generate"
                className="!bg-gold hover:!bg-gold-light !text-primary font-semibold shadow-lg shadow-gold/20 !px-6 !py-2.5 text-sm"
              >
                Generate Birth Chart
              </Button>
              <Button
                href="/horoscope/daily"
                variant="secondary"
                className="!border-white/15 !bg-white/5 hover:!bg-white/10 !px-6 !py-2.5 text-sm text-white backdrop-blur-md"
              >
                Today&apos;s Horoscope
              </Button>
              <Button
                href="/zodiac"
                variant="ghost"
                className="!px-4 !py-2.5 text-sm text-silver hover:text-gold"
              >
                Explore Signs →
              </Button>
            </div>

            {/* Quick Zodiac Sign Bar - High Visibility & Prominent */}
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold lg:justify-start">
                <span>✦</span>
                <span>Quick Zodiac Sign Explorer:</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                {ZODIAC_SIGNS.map((sign) => {
                  const data = ZODIAC_DATA[sign];
                  return (
                    <Link
                      key={sign}
                      href={`/zodiac/${sign}`}
                      prefetch={true}
                      title={`${data.name} (${data.dates})`}
                      className="group flex flex-col items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] p-2 transition-all duration-200 hover:-translate-y-1 hover:border-gold hover:bg-gold/15 hover:shadow-[0_0_20px_rgba(255,209,102,0.3)] backdrop-blur-md"
                    >
                      <span className="text-2xl sm:text-3xl text-gold drop-shadow-[0_2px_8px_rgba(255,209,102,0.35)] transition-transform group-hover:scale-115">
                        {data.symbol}
                      </span>
                      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/90 group-hover:text-gold transition-colors">
                        {data.name.slice(0, 4)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive 3D Zodiac Wheel (Full Circle with Zero Clipping) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center justify-center lg:col-span-5"
          >
            <div className="relative flex w-full items-center justify-center">
              {/* Subtle ambient backglow */}
              <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-accent-purple/20 blur-3xl sm:h-80 sm:w-80" />
              <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-accent-blue/15 blur-2xl" />

              <ZodiacWheel
                interactive
                className="mx-auto aspect-square w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[420px] flex items-center justify-center"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Status / Footer Bar (Slim, Fixed) */}
      <footer className="z-10 flex flex-col items-center justify-between gap-1 border-t border-white/5 pt-2 text-[11px] text-silver/50 sm:flex-row">
        <span>Meeus Precision Astrological Algorithms · IAU Standard Constellations</span>
        <div className="flex items-center gap-4">
          <Link href="/chart/generate" className="hover:text-gold transition-colors">Natal Calculator</Link>
          <Link href="/horoscope/daily" className="hover:text-gold transition-colors">Ephemeris</Link>
          <Link href="/zodiac" className="hover:text-gold transition-colors">Atlas</Link>
          <span>© {new Date().getFullYear()} AstraVerse Observatory</span>
        </div>
      </footer>
    </section>
  );
}
