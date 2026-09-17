'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ZodiacWheel } from '@/components/cosmic/ZodiacWheel';

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-3xl"
      >
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent-blue">
          Discover Your Destiny Through the Stars
        </p>
        <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-white md:text-6xl">
          AstraVerse AI
        </h1>
        <p className="mb-8 text-lg text-silver/90 md:text-xl">
          Real astronomical calculations meet AI-powered cosmic wisdom. Generate your birth chart,
          read daily horoscopes, and explore the zodiac.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href="/chart/generate">Generate Birth Chart</Button>
          <Button href="/horoscope/daily" variant="secondary">
            Today&apos;s Horoscope
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-12 w-full max-w-lg"
      >
        <ZodiacWheel />
      </motion.div>
    </section>
  );
}
