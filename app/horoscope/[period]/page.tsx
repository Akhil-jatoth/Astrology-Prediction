'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AiDisclaimer } from '@/components/ui/AiDisclaimer';
import { AstrologyChatbox } from '@/components/cosmic/AstrologyChatbox';
import { CelestialSkyImageCard } from '@/components/cosmic/CelestialSkyImageCard';
import { ZODIAC_DATA, ZODIAC_SIGNS, type ZodiacSign } from '@/lib/constants';

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#ff6b35',
  Earth: '#4ade80',
  Air: '#93c5fd',
  Water: '#818cf8',
};

const ELEMENT_GLOW: Record<string, string> = {
  Fire: 'rgba(255,107,53,0.3)',
  Earth: 'rgba(74,222,128,0.3)',
  Air: 'rgba(147,197,253,0.3)',
  Water: 'rgba(129,140,248,0.3)',
};

function SignCard({
  sign,
  isSelected,
  onClick,
}: {
  sign: ZodiacSign;
  isSelected: boolean;
  onClick: () => void;
}) {
  const data = ZODIAC_DATA[sign];
  const elemColor = ELEMENT_COLORS[data.element];
  const elemGlow = ELEMENT_GLOW[data.element];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      id={`sign-card-${sign}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-selected={isSelected}
      className={`group cosmic-card relative overflow-hidden rounded-[1.35rem] text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] focus:outline-none ${isSelected ? 'active' : ''}`}
      style={{
        borderColor: isSelected ? elemColor : 'rgba(255,255,255,0.08)',
        background: isSelected
          ? `linear-gradient(135deg, rgba(27,31,74,0.96) 0%, rgba(11,16,38,0.98) 100%)`
          : 'linear-gradient(135deg, rgba(11,16,38,0.8) 0%, rgba(9,13,30,0.92) 100%)',
        boxShadow: isSelected
          ? `0 0 0 1px ${elemColor}22, 0 0 28px ${elemGlow}, 0 0 42px rgba(255,255,255,0.08), 0 12px 34px rgba(2,6,23,0.4)`
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 24px rgba(2,6,23,0.25)',
      }}
    >
      {/* Constellation/Sign preview */}
      <div className="relative w-full overflow-hidden" style={{ height: 130 }}>
        <img
          src={`/signs/${sign}.png`}
          alt={`${sign} zodiac`}
          className={`h-full w-full object-cover transition-transform duration-700 ${isSelected ? 'scale-110' : 'scale-100'}`}
        />
        {/* gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 60%, rgba(11,16,38,${isSelected ? 0.5 : 0.7}) 100%)`,
          }}
        />
        {/* Element badge */}
        <span
          className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: elemColor + '22', color: elemColor, border: `1px solid ${elemColor}55` }}
        >
          {data.element}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl">{data.symbol}</span>
          <div>
            <p className="font-display text-sm font-semibold text-white">{data.name}</p>
            <p className="text-[10px] text-silver/60">{data.dates}</p>
          </div>
        </div>
        {isSelected && (
          <div
            className="mt-1 h-0.5 w-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${elemColor}, transparent)` }}
          />
        )}
      </div>
    </div>
  );
}

function HoroscopeDetail({ sign, dob, tob, targetDate }: { sign: ZodiacSign, dob: string, tob: string, targetDate: string }) {
  const data = ZODIAC_DATA[sign];
  const elemColor = ELEMENT_COLORS[data.element];

  const { data: horoscope, isLoading, isError, error } = useQuery({
    queryKey: ['horoscope', sign, 'daily', targetDate, dob, tob],
    queryFn: async () => {
      const params = new URLSearchParams({ sign, period: 'daily', date: targetDate });
      if (dob) params.append('dob', dob);
      const res = await fetch(`/api/horoscope?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to fetch horoscope');
      return data;
    },
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });

  let contentJson: any = null;
  if (horoscope?.content) {
    try {
      contentJson = JSON.parse(horoscope.content);
    } catch (e) {
      contentJson = { daily: horoscope.content };
    }
  }

  return (
    <div
      id={`horoscope-detail-${sign}`}
      className="cosmic-card rounded-[1.4rem] p-6 transition-all duration-500"
      style={{
        borderColor: elemColor + '44',
        background: 'linear-gradient(135deg, rgba(27,31,74,0.88) 0%, rgba(11,16,38,0.96) 100%)',
        boxShadow: `0 10px 42px rgba(2,6,23,0.45), 0 0 40px ${ELEMENT_GLOW[data.element]}`,
      }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Large sign image view */}
        <div className="flex-shrink-0 overflow-hidden rounded-xl" style={{ width: 280, height: 200 }}>
          <img
            src={`/signs/${sign}.png`}
            alt={`${sign} zodiac stars`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-5xl drop-shadow-lg">{data.symbol}</span>
            <div>
              <h2 className="font-display text-2xl text-white">{data.name}</h2>
              <p className="text-sm" style={{ color: elemColor }}>{data.element} Sign · {data.dates}</p>
            </div>
          </div>

          <p className="mb-3 text-xs text-silver/60">
            📅 {new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
          </p>

          {/* Traits */}
          <div className="flex flex-wrap gap-2">
            {data.traits.map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ background: elemColor + '18', color: elemColor, border: `1px solid ${elemColor}33` }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Lucky details */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Lucky Number', value: String(data.lucky.number) },
              { label: 'Lucky Color', value: data.lucky.color },
              { label: 'Lucky Day', value: data.lucky.day },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-silver/50">{label}</p>
                <p className="text-xs font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Horoscope text */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">⭐</span>
          <h3 className="font-display text-sm text-gold">Cosmic Guidance for this day</h3>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[80, 95, 70, 85].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded"
                style={{ width: `${w}%`, background: 'rgba(255,255,255,0.08)' }}
              />
            ))}
            <p className="mt-2 animate-pulse text-xs text-silver/40">Reading the stars for {data.name}...</p>
          </div>
        ) : isError ? (
          <p className="text-sm text-red-400">
            {error instanceof Error ? error.message : "Could not load guidance. Try again later."}
          </p>
        ) : contentJson ? (
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 text-sm font-semibold tracking-wide text-white">☉ Daily Ephemeris & Transits</h4>
              <p className="whitespace-pre-line text-sm leading-relaxed text-silver">{contentJson.daily}</p>
            </div>
            {contentJson.compatibility && (
              <div>
                <h4 className="mb-2 text-sm font-semibold tracking-wide text-rose-300">♀ Venusian Dynamics & Synastry</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-silver">{contentJson.compatibility}</p>
              </div>
            )}
            {contentJson.career && (
              <div>
                <h4 className="mb-2 text-sm font-semibold tracking-wide text-sky-300">♂ Martial Drive & Vocational Endeavors</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-silver">{contentJson.career}</p>
              </div>
            )}
            {contentJson.spiritual && (
              <div>
                <h4 className="mb-2 text-sm font-semibold tracking-wide text-amber-200">♃ Jupiterian Wisdom & Inner Equilibrium</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-silver">{contentJson.spiritual}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Compatibility */}
      <div className="mt-4">
        <p className="mb-2 text-xs text-silver/50">Best matches for this day</p>
        <div className="flex gap-2">
          {data.compatibility.map((compat) => (
            <div
              key={compat}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>{ZODIAC_DATA[compat].symbol}</span>
              <span className="text-silver/70">{ZODIAC_DATA[compat].name}</span>
            </div>
          ))}
        </div>
      </div>

      {contentJson && (
        <AstrologyChatbox 
          type="horoscope" 
          contextData={`User Sign: ${sign}, Date: ${targetDate}, Horoscope Content: ${JSON.stringify(contentJson)}`} 
        />
      )}

      <AiDisclaimer className="mt-5" />
    </div>
  );
}

export default function DailyHoroscopePage() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-silver/40">Celestial Forecast</p>
        <h1 className="mb-2 font-display text-4xl text-gold">Daily Horoscope</h1>
        <p className="text-sm text-silver/70">{new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
        <p className="mt-2 text-xs text-silver/50">
          Select your zodiac sign to reveal your constellation & cosmic guidance
        </p>
      </div>

      {/* Personalization Inputs & Star Sky Image Generator */}
      <div className="mx-auto mb-10 max-w-2xl rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="mb-4 font-display text-lg text-white">Personalize Date & Celestial Sky</h3>
        <div className="flex flex-col gap-4 sm:flex-row items-end">
          <div className="flex-1 text-left w-full">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-silver/60">Horoscope Date</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetDate(new Date().toISOString().slice(0, 10))}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    targetDate === new Date().toISOString().slice(0, 10)
                      ? 'border-gold bg-gold/20 text-gold font-bold'
                      : 'border-white/10 text-silver/70 hover:bg-white/10'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setTargetDate(new Date(Date.now() - 86400000).toISOString().slice(0, 10))}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    targetDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)
                      ? 'border-gold bg-gold/20 text-gold font-bold'
                      : 'border-white/10 text-silver/70 hover:bg-white/10'
                  }`}
                >
                  Yesterday
                </button>
              </div>
            </div>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-lg bg-black/50 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-gold/50"
              style={{ border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
            />
          </div>
          <div className="flex-1 text-left w-full">
            <label className="mb-1 block text-xs text-silver/60">Date of Birth (Optional)</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-lg bg-black/50 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-gold/50"
              style={{ border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Embedded Star Sky Generator */}
        <div className="mt-6 pt-4 border-t border-white/10 text-left">
          <CelestialSkyImageCard
            initialDate={targetDate}
            initialSign={selectedSign || 'scorpio'}
          />
        </div>
      </div>

      {/* 12 Sign Grid */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {ZODIAC_SIGNS.map((sign) => (
          <SignCard
            key={sign}
            sign={sign}
            isSelected={selectedSign === sign}
            onClick={() => {
              setSelectedSign(sign);
              setTimeout(() => {
                document.getElementById(`horoscope-detail-section`)?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        ))}
      </div>

      {/* Selected sign detail */}
      <div id="horoscope-detail-section" className="scroll-mt-24">
        {selectedSign ? (
          <HoroscopeDetail key={selectedSign} sign={selectedSign} dob={dob} tob={""} targetDate={targetDate} />
        ) : (
          <div className="rounded-2xl p-8 text-center text-silver/60" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <span className="mb-4 block text-4xl">✨</span>
            <p>Please select your zodiac sign above to reveal your cosmic guidance.</p>
          </div>
        )}
      </div>
    </div>
  );
}
