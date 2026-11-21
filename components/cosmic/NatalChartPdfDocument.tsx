'use client';

import React from 'react';
import type { CalculatedChart } from '@/lib/astro-engine';
import { ZODIAC_DATA } from '@/lib/constants';

interface NatalChartPdfDocumentProps {
  chart: CalculatedChart;
  interpretation?: { content: string } | null;
  birthInfo: {
    dob: string;
    birthTime: string;
    city: string;
    country?: string;
  };
}

const HOUSE_DOMAINS = [
  'First House (Ascendant): Self, Vitality & Persona',
  'Second House: Personal Assets, Values & Resources',
  'Third House: Communication, Mental Drive & Siblings',
  'Fourth House (Imum Coeli): Home, Roots & Foundations',
  'Fifth House: Creative Expression, Romance & Pleasure',
  'Sixth House: Daily Vocation, Service & Vital Habits',
  'Seventh House (Descendant): Marriage, Synastry & Alliances',
  'Eighth House: Transformation, Shared Resources & Mysteries',
  'Ninth House: Higher Philosophy, Expansion & Long Travel',
  'Tenth House (Midheaven): Career, Public Legacy & Authority',
  'Eleventh House: Community, Aspirations & Social Networks',
  'Twelfth House: Subconscious Mind, Solitude & Spiritual Growth',
];

export function NatalChartPdfDocument({ chart, interpretation, birthInfo }: NatalChartPdfDocumentProps) {
  const sunData = ZODIAC_DATA[chart.sunSign];
  const moonData = ZODIAC_DATA[chart.moonSign];
  const ascData = ZODIAC_DATA[chart.ascendant];
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="hidden print:block font-sans text-cosmic-950 bg-white p-8 max-w-[210mm] mx-auto text-[13px] leading-normal print-dossier">
      
      {/* ================= PAGE 1 ================= */}
      <div className="min-h-[280mm] flex flex-col justify-between pb-6">
        <div>
          {/* Header & Observatory Emblem */}
          <div className="border-b-2 border-amber-600/40 pb-5 mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-600 text-lg">✦</span>
                <span className="font-display text-sm font-bold tracking-[0.25em] text-amber-700 uppercase">
                  AstraVerse Astrological Observatory
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Official Natal Ephemeris Dossier
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated to Arcsecond Precision via VSOP87 Planetary Ephemerides
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500 border border-amber-500/30 bg-amber-500/5 px-3 py-2 rounded-lg">
              <p className="font-semibold text-slate-700">DOSSIER REF: AV-{Math.abs(chart.sunSign.charCodeAt(0) * 1000 + chart.moonSign.charCodeAt(0))}</p>
              <p>Issued: {formattedDate}</p>
              <p>Coordinate: Geocentric Horizon</p>
            </div>
          </div>

          {/* Subject Birth Meta */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs">
            <div>
              <span className="block font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Date of Birth</span>
              <span className="font-bold text-slate-800 text-sm">{birthInfo.dob || 'Unspecified'}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Time of Birth</span>
              <span className="font-bold text-slate-800 text-sm">{birthInfo.birthTime || '12:00'} (Local)</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Birth Location</span>
              <span className="font-bold text-slate-800 text-sm">{birthInfo.city || 'Standard'}{birthInfo.country ? `, ${birthInfo.country}` : ''}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Ephemeris Engine</span>
              <span className="font-bold text-slate-800 text-sm">VSOP87 Analytical</span>
            </div>
          </div>

          {/* Sacred Astrological Triad */}
          <div className="mb-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
              <span>✦</span>
              <span>The Primary Celestial Triad & Nakshatra</span>
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {/* Sun Sign */}
              <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-3 text-center">
                <span className="text-2xl text-amber-600 block mb-1">{sunData?.symbol || '☉'}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sun Sign</span>
                <span className="font-display font-bold text-slate-900 text-base capitalize block">{chart.sunSign}</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">{sunData?.element} Element · Vital Core</span>
              </div>

              {/* Moon Sign */}
              <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-xl p-3 text-center">
                <span className="text-2xl text-indigo-600 block mb-1">{moonData?.symbol || '☽'}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Moon Sign</span>
                <span className="font-display font-bold text-slate-900 text-base capitalize block">{chart.moonSign}</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">{moonData?.element} Element · Emotional Soul</span>
              </div>

              {/* Ascendant */}
              <div className="border border-sky-500/30 bg-sky-500/5 rounded-xl p-3 text-center">
                <span className="text-2xl text-sky-600 block mb-1">{ascData?.symbol || '☊'}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ascendant (Rising)</span>
                <span className="font-display font-bold text-slate-900 text-base capitalize block">{chart.ascendant}</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">{chart.ascendantDegree} · Outer Persona</span>
              </div>

              {/* Nakshatra */}
              <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-3 text-center">
                <span className="text-2xl text-emerald-600 block mb-1">⭐</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Vedic Nakshatra</span>
                <span className="font-display font-bold text-slate-900 text-base capitalize block">{chart.nakshatra}</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">Lunar Mansion</span>
              </div>
            </div>
          </div>

          {/* Planetary Ephemeris Positions Table */}
          <div className="mb-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
              <span>✦</span>
              <span>Planetary Ephemeris Coordinates</span>
            </h2>
            <table className="w-full border-collapse border border-slate-200 text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-3 font-semibold">Celestial Body</th>
                  <th className="py-2 px-3 font-semibold">Sign Placement</th>
                  <th className="py-2 px-3 font-semibold">Exact Arcdegree</th>
                  <th className="py-2 px-3 font-semibold">Elemental Energy</th>
                  <th className="py-2 px-3 font-semibold">Archetypal Domain</th>
                </tr>
              </thead>
              <tbody>
                {chart.planetPositions.map((p, idx) => {
                  const pData = ZODIAC_DATA[p.sign];
                  return (
                    <tr key={p.planet} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-1.5 px-3 font-bold text-slate-900">{p.planet}</td>
                      <td className="py-1.5 px-3 font-medium capitalize text-slate-800">
                        {pData?.symbol} {p.sign}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-slate-700">{p.degreeFormatted}</td>
                      <td className="py-1.5 px-3 text-slate-600">{pData?.element || '—'}</td>
                      <td className="py-1.5 px-3 text-slate-500 text-[11px]">
                        {p.planet === 'Sun' ? 'Core Identity & Will' :
                         p.planet === 'Moon' ? 'Emotional Instincts' :
                         p.planet === 'Mercury' ? 'Mind & Commerce' :
                         p.planet === 'Venus' ? 'Relational Harmony' :
                         p.planet === 'Mars' ? 'Action & Martial Drive' :
                         p.planet === 'Jupiter' ? 'Abundance & Wisdom' :
                         p.planet === 'Saturn' ? 'Structure & Mastery' :
                         p.planet === 'Uranus' ? 'Innovation & Breakthrough' :
                         p.planet === 'Neptune' ? 'Intuition & Transpersonal' :
                         p.planet === 'Pluto' ? 'Regeneration & Power' : 'Planetary Influence'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Page 1 */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span>AstraVerse Astrological Ephemeris Report · Page 1 of 2</span>
          <span>Certified VSOP87 Astronomical Calculation Model</span>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="min-h-[280mm] flex flex-col justify-between pt-6 border-t-2 border-dashed border-slate-300 print:border-none print:pt-0 page-break">
        <div>
          {/* Header Page 2 */}
          <div className="border-b border-slate-200 pb-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-sm">✦</span>
              <span className="font-display text-xs font-bold tracking-wider text-slate-700 uppercase">
                AstraVerse Dossier · Natal Synthesis & Houses
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Ref: {chart.sunSign.toUpperCase()}-{chart.moonSign.toUpperCase()}</span>
          </div>

          {/* Twelve Astrological Houses Grid */}
          <div className="mb-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
              <span>✦</span>
              <span>The Twelve Astrological Houses (Bhava Cusps)</span>
            </h2>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {chart.houses.map((h) => {
                const hData = ZODIAC_DATA[h.sign];
                const domain = HOUSE_DOMAINS[h.house - 1] || `House ${h.house}`;
                return (
                  <div key={h.house} className="border border-slate-200 bg-slate-50/70 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-800 text-[11px]">House {h.house}</span>
                      <span className="text-xs font-semibold capitalize text-slate-800">
                        {hData?.symbol} {h.sign}
                      </span>
                    </div>
                    <p className="text-[10px] leading-tight text-slate-500">
                      {domain.split(': ')[1] || domain}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comprehensive Natal Synthesis */}
          <div className="mb-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
              <span>✦</span>
              <span>Natal Chart Synthesis & Archetypal Delineation</span>
            </h2>
            <div className="border border-slate-200 bg-slate-50/40 rounded-xl p-5 text-slate-700 leading-relaxed text-xs space-y-3">
              {interpretation?.content ? (
                interpretation.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line">{paragraph}</p>
                ))
              ) : (
                <>
                  <p>
                    Your natal geometry reflects a powerful alignment between conscious purpose and instinctual wisdom. With the Sun in {chart.sunSign}, your vital essence is fueled by the core archetype of that sign—seeking self-expression through its elemental matrix.
                  </p>
                  <p>
                    The Moon in {chart.moonSign} governs your emotional sanctuary, conditioning how you process security and relational bonds. With {chart.ascendant} rising on the eastern horizon, your initial persona and outer vehicle offer a compelling threshold to the world.
                  </p>
                  <p>
                    Your Vedic nakshatra, {chart.nakshatra}, provides an auspicious karmic current, supporting personal mastery, focused ambition, and spiritual growth when aligned with ethical diligence.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Official Observatory Certification Seal */}
          <div className="border border-amber-600/30 bg-amber-500/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-amber-600 flex items-center justify-center font-display text-amber-700 font-bold text-xs">
                ✦ AV ✦
              </div>
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wider text-slate-800">
                  Certified Astrological Ephemeris Report
                </p>
                <p className="text-[11px] text-slate-500">
                  Computed via Jean Meeus Astronomical Theory & IAU Celestial Constants.
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              <p>Certified for Self-Reflection & Guidance</p>
              <p>© {new Date().getFullYear()} AstraVerse Observatory</p>
            </div>
          </div>
        </div>

        {/* Footer Page 2 */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span>AstraVerse Astrological Ephemeris Report · Page 2 of 2</span>
          <span>Verified Astronomical Ephemeris Signature</span>
        </div>
      </div>
    </div>
  );
}

