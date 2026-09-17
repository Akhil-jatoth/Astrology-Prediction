'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { GeocodeResult } from '@/lib/geocode';

export default function ProfilePage() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [gender, setGender] = useState('prefer-not');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('en');
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<GeocodeResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const u = data.user;
      if (!u) return;
      setName(u.name ?? '');
      setGender(u.gender ?? 'prefer-not');
      setCountry(u.country ?? '');
      setLanguage(u.language ?? 'en');
      if (u.birthProfile) {
        setDob(u.birthProfile.dob);
        setBirthTime(u.birthProfile.birthTime);
        setSelectedPlace(u.birthProfile.birthPlace);
        setPlaceQuery(u.birthProfile.birthPlace.name);
      }
    })();
  }, [user, getIdToken]);

  const searchPlace = async (q: string) => {
    setPlaceQuery(q);
    if (q.length < 2) {
      setPlaceResults([]);
      return;
    }
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setPlaceResults(data.results ?? []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) {
      setMessage('Please select a birth place.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const token = user ? await getIdToken() : null;
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          dob,
          birthTime,
          birthPlace: selectedPlace,
          gender,
          country,
          language,
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      setMessage('Profile saved successfully.');
    } catch {
      setMessage('Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <p className="text-silver">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-28">
      <h1 className="mb-2 font-display text-3xl text-gold">Birth Profile</h1>
      <p className="mb-8 text-sm text-silver">
        Your birth data is used for chart calculations. Stored securely and never used to invent
        planetary positions.
      </p>

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs text-silver">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="cosmic-input"
            />
          </div>

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

          <div className="relative">
            <label htmlFor="birthPlace" className="mb-1 block text-xs text-silver">
              Birth Place
            </label>
            <input
              id="birthPlace"
              type="text"
              required
              value={placeQuery}
              onChange={(e) => searchPlace(e.target.value)}
              className="cosmic-input"
            />
            {placeResults.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-white/10 bg-primary/90 shadow-[0_12px_32px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                {placeResults.map((p) => (
                  <li key={p.name}>
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 text-left text-sm text-silver transition-colors hover:bg-white/10"
                      onClick={() => {
                        setSelectedPlace(p);
                        setPlaceQuery(p.name);
                        setPlaceResults([]);
                      }}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="gender" className="mb-1 block text-xs text-silver">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="cosmic-input"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label htmlFor="country" className="mb-1 block text-xs text-silver">
                Country
              </label>
              <input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="cosmic-input"
              />
            </div>
            <div>
              <label htmlFor="language" className="mb-1 block text-xs text-silver">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="cosmic-input"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
