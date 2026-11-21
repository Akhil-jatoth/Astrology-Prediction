'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AiDisclaimer } from '@/components/ui/AiDisclaimer';
import { ConstellationCanvas } from '@/components/cosmic/ConstellationCanvas';
import { useChartStore } from '@/store/useChartStore';
import { useAuth } from '@/hooks/useAuth';
import type { GeocodeResult } from '@/lib/geocode';
import { AstrologyChatbox } from '@/components/cosmic/AstrologyChatbox';
import { NatalChartPdfDocument } from '@/components/cosmic/NatalChartPdfDocument';
import { CelestialSkyImageCard } from '@/components/cosmic/CelestialSkyImageCard';

export default function ChartGeneratePage() {
  const { user, getIdToken } = useAuth();
  const { lastChart, lastInterpretation, setChart } = useChartStore();

  const handleDownloadPdf = () => {
    window.print();
  };

  const [dob, setDob] = useState('');
  const [birthTime, setBirthTime] = useState('');
  
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [selectedStar, setSelectedStar] = useState<{name: string, sign: string} | null>(null);
  const [starMeaning, setStarMeaning] = useState<{content: string} | null>(null);
  const [loadingStar, setLoadingStar] = useState(false);

  const handleStarClick = async (starName: string, sign: string) => {
    setSelectedStar({ name: starName, sign });
    setStarMeaning(null);
    setLoadingStar(true);
    
    try {
      const res = await fetch('/api/star-meaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starName, chart: lastChart }),
      });
      if (!res.ok) throw new Error('Failed to fetch star meaning');
      const data = await res.json();
      setStarMeaning(data.interpretation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStar(false);
    }
  };

  const [placeResults, setPlaceResults] = useState<GeocodeResult[]>([]);
  const searchAbortController = useRef<AbortController | null>(null);

  const searchPlace = async (q: string) => {
    setCity(q);
    setSelectedPlace(null);
    setError('');

    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }

    if (q.trim().length < 2) {
      setPlaceResults([]);
      return;
    }

    const abortController = new AbortController();
    searchAbortController.current = abortController;

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q.trim())}`, {
        signal: abortController.signal,
      });
      const data = await res.json();
      
      if (!abortController.signal.aborted) {
        setPlaceResults(data.results ?? []);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setPlaceResults([]);
      }
    }
  };

  const handleSuggestionClick = (p: GeocodeResult) => {
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    setSelectedPlace(p);
    setPlaceResults([]);
    
    // Attempt to split the name into fields
    const parts = p.name.split(',').map((s) => s.trim());
    setCity(parts[0] || '');
    if (parts.length > 2) {
      setState(parts[1] || '');
      setCountry(parts[2] || '');
    } else if (parts.length === 2) {
      setCountry(parts[1] || '');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dob || !birthTime) {
      setError('Please provide both Date and Time of birth.');
      return;
    }

    let placeToSubmit = selectedPlace;

    setLoading(true);
    setError('');

    try {
      if (!placeToSubmit) {
        if (!city) {
          setError('Please enter your birth city.');
          setLoading(false);
          return;
        }

        // Search by city to increase chances of open-meteo finding it
        const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(city)}`);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          // If country is provided, try to find a match, else take first
          let match = geoData.results[0];
          if (country) {
            const countryMatch = geoData.results.find((r: any) => 
              r.name.toLowerCase().includes(country.toLowerCase())
            );
            if (countryMatch) match = countryMatch;
          }
          placeToSubmit = match;
          setSelectedPlace(placeToSubmit);
        } else {
          setError('Could not find that location. Please pick from the suggestions or provide a nearby larger city.');
          setLoading(false);
          return;
        }
      }

      if (!placeToSubmit) return; // safety check

      const token = user ? await getIdToken() : null;

      const res = await fetch('/api/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          dob,
          birthTime,
          lat: placeToSubmit.lat,
          lng: placeToSubmit.lng,
          tzOffset: placeToSubmit.tzOffset,
        }),
      });

      if (!res.ok) throw new Error('Chart generation failed');
      const data = await res.json();
      setChart(data.calculated, data.interpretation);
      setHasGenerated(true);
    } catch {
      setError('Could not generate chart. Check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28">
      <div className="print:hidden">
        <h1 className="mb-2 font-display text-3xl text-gold">Birth Chart Generator</h1>
        <p className="mb-8 text-silver">
          Planetary positions computed with VSOP87 analytical solutions and arcsecond astronomical precision.
        </p>

        <Card className="mb-8">
          <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dob" className="mb-1 block text-xs text-silver">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="cosmic-input"
              />
            </div>
            <div>
              <label htmlFor="birthTime" className="mb-1 block text-xs text-silver">
                Birth Time
              </label>
              <input
                id="birthTime"
                type="time"
                required
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="cosmic-input"
              />
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="mb-3 text-sm text-gold font-semibold">Birth Location</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <label htmlFor="city" className="mb-1 block text-xs text-silver">City *</label>
                <input
                  id="city"
                  type="text"
                  required
                  placeholder="e.g. New York"
                  value={city}
                  onChange={(e) => searchPlace(e.target.value)}
                  className="cosmic-input"
                  autoComplete="off"
                />
                {placeResults.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-white/10 bg-primary/90 shadow-[0_12px_32px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                    {placeResults.map((p) => (
                      <li key={p.name}>
                        <button
                          type="button"
                          className="w-full px-4 py-2.5 text-left text-sm text-silver transition-colors hover:bg-white/10 hover:text-white"
                          onClick={() => handleSuggestionClick(p)}
                        >
                          {p.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label htmlFor="state" className="mb-1 block text-xs text-silver">State / Province</label>
                <input
                  id="state"
                  type="text"
                  placeholder="e.g. NY"
                  value={state}
                  onChange={(e) => { setState(e.target.value); setSelectedPlace(null); }}
                  className="cosmic-input"
                />
              </div>
              <div>
                <label htmlFor="country" className="mb-1 block text-xs text-silver">Country *</label>
                <input
                  id="country"
                  type="text"
                  required
                  placeholder="e.g. USA"
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setSelectedPlace(null); }}
                  className="cosmic-input"
                />
              </div>
              <div>
                <label htmlFor="pinCode" className="mb-1 block text-xs text-silver">PIN / Zip Code</label>
                <input
                  id="pinCode"
                  type="text"
                  placeholder="e.g. 10001"
                  value={pinCode}
                  onChange={(e) => { setPinCode(e.target.value); setSelectedPlace(null); }}
                  className="cosmic-input"
                />
              </div>
            </div>
          </div>

          {selectedPlace && selectedPlace.lat !== 0 && selectedPlace.lng !== 0 && (
            <div className="mt-2 rounded-lg bg-accent-blue/10 p-3 border border-accent-blue/30">
              <p className="text-xs text-accent-blue">
                Verified Location: {selectedPlace.name} 
                <br />
                Coordinates: {selectedPlace.lat.toFixed(2)}°, {selectedPlace.lng.toFixed(2)}° (UTC
                {selectedPlace.tzOffset >= 0 ? '+' : ''}{selectedPlace.tzOffset})
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading ? 'Calculating Planetary Positions...' : 'Generate Chart'}
          </Button>
        </form>
      </Card>
      </div>

      {hasGenerated && lastChart && (
        <>
          <div className="space-y-6 print:hidden">
            {/* PDF Export Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gold/30 bg-gold/10 backdrop-blur-md shadow-xl">
              <div>
                <h3 className="font-display text-lg font-bold text-gold flex items-center gap-2">
                  <span>✦</span>
                  <span>Official Natal Ephemeris Dossier Ready</span>
                </h3>
                <p className="text-xs text-silver/80">
                  Download or print your certified 2-page astrological report with exact planetary degrees and house cusps.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold hover:bg-gold-light text-primary font-bold px-5 py-2.5 text-xs shadow-lg shadow-gold/20 hover:scale-105 transition-all flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export PDF Report</span>
              </button>
            </div>

            <Card>
              <h2 className="mb-4 font-display text-xl text-gold">Your Placements</h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-md bg-primary/40 p-4 text-center">
                <p className="text-xs text-silver">Sun</p>
                <p className="font-display text-lg capitalize text-white">{lastChart.sunSign}</p>
              </div>
              <div className="rounded-md bg-primary/40 p-4 text-center">
                <p className="text-xs text-silver">Moon</p>
                <p className="font-display text-lg capitalize text-white">{lastChart.moonSign}</p>
              </div>
              <div className="rounded-md bg-primary/40 p-4 text-center">
                <p className="text-xs text-silver">Ascendant</p>
                <p className="font-display text-lg capitalize text-white">{lastChart.ascendant}</p>
              </div>
            </div>

            <p className="mb-4 text-sm text-silver">
              Nakshatra: <span className="text-gold">{lastChart.nakshatra}</span>
            </p>

            <div className="my-8 flex flex-col items-center border-t border-b border-white/10 py-8">
              <h3 className="mb-2 text-center font-display text-lg text-white">Your Birth Constellation</h3>
              <p className="mb-6 text-center text-sm text-silver/70">
                Click on the bright stars in {lastChart.sunSign} to reveal their cosmic significance for you.
              </p>
              
              <div className="relative mx-auto rounded-xl border border-white/5 bg-black/40 p-4">
                <ConstellationCanvas 
                  sign={lastChart.sunSign} 
                  width={320} 
                  height={320} 
                  onStarClick={handleStarClick}
                />
              </div>

              {selectedStar && (
                <div className="mt-6 w-full max-w-lg rounded-xl bg-white/5 p-6 backdrop-blur-md">
                  <h4 className="mb-2 font-display text-lg text-gold">{selectedStar.name}</h4>
                  {loadingStar ? (
                    <div className="flex animate-pulse space-x-2">
                      <div className="h-2 w-2 rounded-full bg-silver"></div>
                      <div className="h-2 w-2 rounded-full bg-silver"></div>
                      <div className="h-2 w-2 rounded-full bg-silver"></div>
                    </div>
                  ) : starMeaning ? (
                    <>
                      <p className="whitespace-pre-line text-sm text-silver">{starMeaning.content}</p>
                      <AiDisclaimer className="mt-4" />
                    </>
                  ) : (
                    <p className="text-sm text-red-400">Could not read star meaning.</p>
                  )}
                </div>
              )}

              {/* High-Resolution Downloadable Celestial Star Image */}
              <div className="mt-8 w-full max-w-2xl">
                <CelestialSkyImageCard
                  initialDate={dob || new Date().toISOString().slice(0, 10)}
                  initialSign={lastChart.sunSign}
                  title={`Celestial Sky & Star Map for ${lastChart.sunSign.toUpperCase()}`}
                />
              </div>
            </div>

            <h3 className="mb-2 text-sm font-semibold text-white">Planet Positions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-silver">
                    <th className="py-2 pr-4">Planet</th>
                    <th className="py-2 pr-4">Sign</th>
                    <th className="py-2">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {lastChart.planetPositions.map((p) => (
                    <tr key={p.planet} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-white">{p.planet}</td>
                      <td className="py-2 pr-4 capitalize text-silver">{p.sign}</td>
                      <td className="py-2 text-silver">{p.degreeFormatted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mb-2 mt-6 text-sm font-semibold text-white">Houses</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {lastChart.houses.map((h) => (
                <div key={h.house} className="rounded-md bg-primary/30 p-2 text-center text-xs">
                  <p className="text-silver/70">H{h.house}</p>
                  <p className="capitalize text-white">{h.sign}</p>
                </div>
              ))}
            </div>
          </Card>

          {lastInterpretation && (
            <Card>
              <h2 className="mb-4 font-display text-xl text-gold">Natal Chart Synthesis & Archetypal Reading</h2>
              <p className="whitespace-pre-line leading-relaxed text-silver">
                {lastInterpretation.content}
              </p>
              <AiDisclaimer className="mt-6" />
            </Card>
          )}

          <AstrologyChatbox 
            type="birth-chart" 
            contextData={`Birth Chart Placements: ${JSON.stringify(lastChart)}`} 
          />
        </div>

        {/* Printable Multi-Page PDF Document Component */}
        <NatalChartPdfDocument
          chart={lastChart}
          interpretation={lastInterpretation}
          birthInfo={{
            dob,
            birthTime,
            city: selectedPlace?.name ? selectedPlace.name.split(',')[0].trim() : (city || 'Standard Horizon'),
            country: selectedPlace?.name ? selectedPlace.name.split(',').slice(-1)[0]?.trim() : country,
          }}
        />
      </>
    )}
  </div>
);
}
