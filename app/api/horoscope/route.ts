import { NextRequest, NextResponse } from 'next/server';
import { AI_DISCLAIMER, ZODIAC_DATA } from '@/lib/constants';
import { connectDB, isDbConfigured } from '@/lib/db/connect';
import { HoroscopeCache } from '@/lib/db/models/HoroscopeCache';
import { ZODIAC_SIGNS, type ZodiacSign } from '@/lib/constants';

// Inline planet computation so this stays a server route
import { J2000Century } from 'astronomia/base';
import { apparentLongitude } from 'astronomia/solar';
import { position as moonPosition } from 'astronomia/moonposition';
import { Planet } from 'astronomia/planetposition';
import data from 'astronomia/data';

function toJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

const SIGN_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
] as const;

function longitudeToSign(lon: number): string {
  return SIGN_NAMES[Math.floor(((lon % 360) + 360) % 360 / 30)];
}
function formatDeg(lon: number): string {
  const n = ((lon % 360) + 360) % 360;
  const deg = Math.floor(n % 30);
  const min = Math.floor((n % 1) * 60);
  return `${deg}°${min.toString().padStart(2,'0')}'`;
}

function toCartesian(lon: number, lat: number, r: number) {
  const c = Math.cos(lat);
  return { x: r * c * Math.cos(lon), y: r * c * Math.sin(lon), z: r * Math.sin(lat) };
}
function cartesianToLon(x: number, y: number): number {
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

function getGeocentric(helio: { lon: number; lat: number; range: number }, earth: { lon: number; lat: number; range: number }): number {
  const p = toCartesian(helio.lon, helio.lat, helio.range);
  const e = toCartesian(earth.lon, earth.lat, earth.range);
  return cartesianToLon(p.x - e.x, p.y - e.y);
}

const earthPlanet = new Planet(data.earth);
const OUTER_PLANETS: Record<string, keyof typeof data> = {
  Mercury: 'mercury', Venus: 'venus', Mars: 'mars',
  Jupiter: 'jupiter', Saturn: 'saturn', Uranus: 'uranus', Neptune: 'neptune',
};

function getDailyPlanetPositions(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const jd = toJulianDay(new Date(Date.UTC(y, m - 1, d, 12, 0)));
  const T = J2000Century(jd);
  const earthPos = earthPlanet.position(jd);

  const sun = ((apparentLongitude(T) * 180 / Math.PI) + 360) % 360;
  const moon = ((moonPosition(jd).lon * 180 / Math.PI) + 360) % 360;

  const planets: { planet: string; sign: string; degree: string; retrograde?: boolean }[] = [
    { planet: 'Sun', sign: longitudeToSign(sun), degree: formatDeg(sun) },
    { planet: 'Moon', sign: longitudeToSign(moon), degree: formatDeg(moon) },
  ];

  for (const [name, key] of Object.entries(OUTER_PLANETS)) {
    const p = new Planet(data[key]);
    const pos = p.position(jd);
    const lon = getGeocentric(pos, earthPos);
    planets.push({ planet: name, sign: longitudeToSign(lon), degree: formatDeg(lon) });
  }

  return { jd, planets };
}

function buildAIPrompt(sign: string, dateStr: string, planets: ReturnType<typeof getDailyPlanetPositions>['planets'], dob: string | null, tob: string | null): string {
  const sun = planets.find(p => p.planet === 'Sun');
  const moon = planets.find(p => p.planet === 'Moon');
  const mercury = planets.find(p => p.planet === 'Mercury');
  const venus = planets.find(p => p.planet === 'Venus');
  const mars = planets.find(p => p.planet === 'Mars');
  const jupiter = planets.find(p => p.planet === 'Jupiter');
  const saturn = planets.find(p => p.planet === 'Saturn');

  const planetSummary = planets.map(p => `${p.planet} in ${p.sign} (${p.degree})`).join(', ');

  const personalInfo = dob ? `The user was born on ${dob}${tob ? ` at ${tob}` : ''}. Factor this into the reading if possible.` : ``;

  return `You are the AstraVerse Master Astrologer and Celestial Ephemeris Scholar, providing authoritative astrological analysis steeped in psychological depth and astronomical rigor. Never refer to yourself as an AI, bot, or machine.

Today's Real Planetary Positions (${dateStr}):
${planetSummary}

Write a daily ephemeris transit reading for ${sign.charAt(0).toUpperCase() + sign.slice(1)} for ${dateStr}.
${personalInfo}

Guidelines:
- Use ONLY the actual planetary positions listed above. Do NOT invent positions.
- Reference specific planets that actually aspect or influence ${sign} today with grounded astrological depth.
- Sun is in ${sun?.sign}, Moon is in ${moon?.sign} — articulate how these archetypal currents influence ${sign} today.
- ${mercury ? `Mercury in ${mercury.sign}` : ''} influences communication, mental clarity, and perception.
- ${venus ? `Venus in ${venus.sign}` : ''} shapes relational dynamics, synastry, and aesthetic values.
- ${mars ? `Mars in ${mars.sign}` : ''} energizes martial ambition, initiative, and decisive action.
- ${jupiter ? `Jupiter in ${jupiter.sign}` : ''} brings philosophical expansion, luck, and wisdom.
- ${saturn ? `Saturn in ${saturn.sign}` : ''} governs discipline, structure, and foundational mastery.
- Use second person ("you"). Write with timeless elegance and psychological resonance. Use tendency-based language (not deterministic certainty).

CRITICAL INSTRUCTION: You MUST return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks (\`\`\`json). Just the raw JSON object. The object must strictly match this format:
{
  "daily": "String containing the general daily ephemeris transit influences and personal focus (1-2 paragraphs).",
  "compatibility": "String containing Venusian synastry advice and relationship harmony for today.",
  "career": "String containing vocational focus, financial strategy, and proactive endeavors.",
  "spiritual": "String containing introspective contemplation and celestial mindfulness for equilibrium."
}`;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

let dbWarningShown = false;
let openAiWarningShown = false;

async function tryConnectDB(): Promise<boolean> {
  if (!isDbConfigured()) return false;

  try {
    await connectDB();
    return true;
  } catch {
    if (!dbWarningShown) {
      console.warn('MongoDB unavailable; continuing without cache.');
      dbWarningShown = true;
    }
    return false;
  }
}

let openAiDisabledUntil = 0;

async function callOpenAI(prompt: string): Promise<string> {
  // 1. Prioritize Groq high-speed inference if key configured
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.startsWith('gsk_')) {
    try {
      const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 800,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return json.choices?.[0]?.message?.content ?? '';
      }
    } catch (groqErr) {
      console.warn('Groq horoscope call failed, trying fallback:', groqErr);
    }
  }

  // 2. Fallback to OpenAI if configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || Date.now() < openAiDisabledUntil) {
    throw new Error('OpenAI API not available or temporarily paused');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 401 || res.status === 429) {
        // Cache failure so subsequent clicks are instantaneous
        openAiDisabledUntil = Date.now() + 300000;
      }
      const err = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${err}`);
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? '';
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function mockHoroscope(sign: string, planets: ReturnType<typeof getDailyPlanetPositions>['planets'], dateStr: string): string {
  const s = sign.charAt(0).toUpperCase() + sign.slice(1);
  const signData = ZODIAC_DATA[sign as ZodiacSign];
  
  const sun = planets.find(p => p.planet === 'Sun');
  const moon = planets.find(p => p.planet === 'Moon');
  const mercury = planets.find(p => p.planet === 'Mercury');
  const venus = planets.find(p => p.planet === 'Venus');
  const mars = planets.find(p => p.planet === 'Mars');
  const jupiter = planets.find(p => p.planet === 'Jupiter');

  const getIdx = (category: string, max: number) => {
    const hashStr = dateStr + sign + category;
    const hash = hashStr.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    return Math.abs(hash) % max;
  };

  const intros = [
    `The cosmic energies are shifting around you today.`,
    `A new planetary alignment brings fresh perspective.`,
    `The stars align to guide your path today.`,
    `Today's celestial movements highlight new opportunities.`,
    `Listen closely to the subtle shifts in the universe today.`,
    `Your ruling elements are reacting strongly to today's transits.`
  ];

  const focuses = [
    `your focus is drawn towards inner balance and reflection.`,
    `you might feel a surge of creative energy urging you to act.`,
    `it's a great time to tackle lingering tasks that need your attention.`,
    `you should prioritize your emotional well-being and rest.`,
    `social connections will bring unexpected insights.`,
    `trusting your intuition will lead to a breakthrough.`
  ];

  const merc = [
    `Mercury in ${mercury?.sign} influences your communication, urging clarity.`,
    `With Mercury residing in ${mercury?.sign}, expect deep conversations.`,
    `Your mind is sharp today, thanks to Mercury's transit in ${mercury?.sign}.`,
    `Be mindful of miscommunications as Mercury moves through ${mercury?.sign}.`
  ];

  const ven = [
    `Venus in ${venus?.sign} sets the tone for your relationships today. Be present and receptive without forcing the moment.`,
    `Love takes a comforting shape with Venus in ${venus?.sign}. Show appreciation to those close to you.`,
    `Your romantic energy is heightened by Venus in ${venus?.sign}. It's a day for deep emotional connection.`,
    `With Venus influencing ${venus?.sign}, prioritize self-love and harmony in your interactions.`
  ];

  const mar = [
    `Mars in ${mars?.sign} brings energy to your ambitions. Your ${signData?.element?.toLowerCase() ?? 'cosmic'} nature thrives when you stay consistent.`,
    `Take bold action today. Mars in ${mars?.sign} gives you the courage to overcome obstacles.`,
    `With Mars transiting ${mars?.sign}, channel your fiery energy into productive career moves.`,
    `Patience is key today. While Mars in ${mars?.sign} pushes you forward, avoid rushing important decisions.`
  ];

  const jup = [
    `Jupiter in ${jupiter?.sign} expands your spiritual horizon. The stars (graham) are supporting your natural rhythm today.`,
    `Look for signs of growth. Jupiter in ${jupiter?.sign} brings a sense of optimism to your cosmic journey.`,
    `Your philosophical side is awakened by Jupiter in ${jupiter?.sign}. Take time to meditate on your path.`,
    `With Jupiter in ${jupiter?.sign}, luck favors the open-minded. Embrace new perspectives.`
  ];

  const fallbackJson = {
    daily: `Dear ${s}, ${intros[getIdx('intro', intros.length)]} With the Sun in ${sun?.sign} and the Moon illuminating ${moon?.sign}, ${focuses[getIdx('focus', focuses.length)]} ${merc[getIdx('merc', merc.length)]}`,
    compatibility: ven[getIdx('ven', ven.length)],
    career: mar[getIdx('mar', mar.length)],
    spiritual: jup[getIdx('jup', jup.length)]
  };
  
  return JSON.stringify(fallbackJson);
}

export async function GET(request: NextRequest) {
  const sign = request.nextUrl.searchParams.get('sign') as ZodiacSign | null;
  const period = request.nextUrl.searchParams.get('period') ?? 'daily';
  const date = request.nextUrl.searchParams.get('date') ?? todayKey();
  const dob = request.nextUrl.searchParams.get('dob');
  const tob = request.nextUrl.searchParams.get('tob');

  if (!sign || !ZODIAC_SIGNS.includes(sign)) {
    return NextResponse.json({ error: 'Invalid sign' }, { status: 400 });
  }

  try {
    // Check DB cache first if MongoDB is available and no custom DOB is provided.
    const dbAvailable = await tryConnectDB();
    if (dbAvailable && !dob) {
      const cached = await HoroscopeCache.findOne({ sign, period, category: 'general', date });
      if (cached) {
        return NextResponse.json({ sign, period, date, content: cached.content, cached: true });
      }
    }

    // Compute real planetary positions for this date
    const { planets } = getDailyPlanetPositions(date);

    // Generate horoscope via OpenAI API using real planet positions
    let content: string;
    try {
      const prompt = buildAIPrompt(sign, date, planets, dob, tob);
      let rawContent = await callOpenAI(prompt);
      // Try parsing to ensure it's valid JSON
      if (rawContent.startsWith('```json')) {
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      JSON.parse(rawContent); // Validate
      content = rawContent;
    } catch (e) {
      if (!openAiWarningShown) {
        console.warn('OpenAI API unavailable or returned invalid JSON; using local horoscope fallback.', e);
        openAiWarningShown = true;
      }
      content = mockHoroscope(sign, planets, date);
    }

    // Cache in DB only when MongoDB connected successfully and no custom DOB.
    if (dbAvailable && !dob) {
      try {
        await HoroscopeCache.findOneAndUpdate(
          { sign, period, category: 'general', date },
          { content, generatedAt: new Date() },
          { upsert: true }
        );
      } catch (cacheErr) {
        console.warn('Failed to cache horoscope, continuing without cache:', cacheErr);
      }
    }

    return NextResponse.json({
      sign,
      period,
      date,
      content,
      planets,
      disclaimer: AI_DISCLAIMER,
      cached: false,
    });
  } catch (err) {
    console.error('Horoscope error:', err);
    return NextResponse.json(
      {
        error: 'Failed to fetch horoscope',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
