import { Hero } from '@/components/cosmic/Hero';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ZODIAC_SIGNS, ZODIAC_DATA } from '@/lib/constants';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="mb-12 text-center font-display text-3xl text-gold">
          Explore the Zodiac
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ZODIAC_SIGNS.map((sign) => (
            <Link key={sign} href={`/zodiac/${sign}`}>
              <Card className="group h-full transition-transform hover:-translate-y-1">
                <div className="mb-2 text-3xl">{ZODIAC_DATA[sign].symbol}</div>
                <h3 className="font-display text-lg text-white group-hover:text-gold">
                  {ZODIAC_DATA[sign].name}
                </h3>
                <p className="text-xs text-silver/70">{ZODIAC_DATA[sign].dates}</p>
                <p className="mt-2 text-sm text-silver">{ZODIAC_DATA[sign].element}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-24 text-center">
        <Card glow>
          <h2 className="mb-4 font-display text-2xl text-gold">Ready to Begin?</h2>
          <p className="mb-6 text-silver">
            Create your account, set your birth profile, and unlock personalized cosmic insights.
          </p>
          <Button href="/signup">Start Your Journey</Button>
        </Card>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-silver/50">
        <p>© {new Date().getFullYear()} AstraVerse AI. For guidance and entertainment only.</p>
      </footer>
    </>
  );
}
