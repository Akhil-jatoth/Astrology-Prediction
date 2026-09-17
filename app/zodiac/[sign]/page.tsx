import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConstellationCanvas } from '@/components/cosmic/ConstellationCanvas';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ZODIAC_SIGNS, ZODIAC_DATA, type ZodiacSign } from '@/lib/constants';

interface PageProps {
  params: Promise<{ sign: string }>;
}

export function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({ sign }));
}

export default async function ZodiacSignPage({ params }: PageProps) {
  const { sign } = await params;
  const validSign = sign as ZodiacSign;
  if (!ZODIAC_SIGNS.includes(validSign)) notFound();

  const data = ZODIAC_DATA[validSign];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28">
      <div className="mb-8 text-center">
        <span className="text-6xl">{data.symbol}</span>
        <h1 className="mt-4 font-display text-4xl text-gold">{data.name}</h1>
        <p className="text-silver">
          {data.dates} · {data.element}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="mb-4 overflow-hidden rounded-xl">
            <ConstellationCanvas sign={validSign} width={640} height={240} animated clickable />
          </div>
          <h2 className="mb-3 font-display text-xl text-white">Core Traits</h2>
          <div className="flex flex-wrap gap-2">
            {data.traits.map((trait) => (
              <span
                key={trait}
                className="rounded-pill bg-accent-purple/20 px-4 py-1 text-sm text-silver"
              >
                {trait}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-xl text-white">Compatibility</h2>
          <div className="flex flex-wrap gap-3">
            {data.compatibility.map((c) => (
              <Link
                key={c}
                href={`/zodiac/${c}`}
                className="flex items-center gap-2 rounded-md bg-primary/40 px-4 py-2 transition-colors hover:bg-primary/60"
              >
                <span>{ZODIAC_DATA[c].symbol}</span>
                <span className="text-silver">{ZODIAC_DATA[c].name}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-xl text-white">Lucky Attributes</h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-silver/70">Lucky Number</dt>
              <dd className="text-lg text-gold">{data.lucky.number}</dd>
            </div>
            <div>
              <dt className="text-xs text-silver/70">Lucky Color</dt>
              <dd className="text-lg text-gold">{data.lucky.color}</dd>
            </div>
            <div>
              <dt className="text-xs text-silver/70">Lucky Day</dt>
              <dd className="text-lg text-gold">{data.lucky.day}</dd>
            </div>
          </dl>
        </Card>

        <div className="text-center">
          <Button href={`/horoscope/daily`}>Read Daily Horoscope</Button>
        </div>
      </div>
    </div>
  );
}
