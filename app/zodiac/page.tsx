import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ZODIAC_SIGNS, ZODIAC_DATA } from '@/lib/constants';

export default function ZodiacIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28">
      <h1 className="mb-2 font-display text-3xl text-gold">The Zodiac</h1>
      <p className="mb-8 text-silver">Explore all twelve signs of the cosmic wheel</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ZODIAC_SIGNS.map((sign) => (
          <Link key={sign} href={`/zodiac/${sign}`}>
            <Card className="h-full transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{ZODIAC_DATA[sign].symbol}</span>
                <div>
                  <h2 className="font-display text-lg text-white">{ZODIAC_DATA[sign].name}</h2>
                  <p className="text-xs text-silver/70">{ZODIAC_DATA[sign].dates}</p>
                  <p className="mt-2 text-sm text-silver">
                    {ZODIAC_DATA[sign].traits.slice(0, 2).join(' · ')}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
