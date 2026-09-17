# AstraVerse AI

**Discover Your Destiny Through the Stars**

Phase 1 MVP of an astrology platform that separates **deterministic astronomical calculations** from **AI interpretation** — LLMs never invent planetary positions.

## Architecture

| Layer | Responsibility |
|---|---|
| **Calculation Engine** (`lib/astro-engine`) | Planet positions, ascendant, houses, nakshatra via `astronomia` |
| **Interpretation Layer** (`lib/ai`) | Gemini/OpenAI reads calculated chart data; mock fallback for local dev |
| **API Routes** | Chart generation, cached horoscopes, profile, geocoding |

## Phase 1 Features

- Hero landing page with starfield + 3D zodiac wheel (lazy-loaded)
- Firebase auth (email + Google) with demo mode when unconfigured
- User birth profile (DOB, time, place with geocoding)
- Birth chart generator with real ephemeris calculations
- Daily horoscope cached per sign per day
- 12 zodiac reference pages
- Responsive layout + PWA manifest

## Quick Start

```bash
npm install
cp .env.example .env.local   # optional — app runs in demo mode without keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Setup

1. **MongoDB Atlas** — set `MONGODB_URI` for profile/chart persistence and horoscope caching
2. **Firebase** — create a project, enable Email + Google auth, add client + admin credentials
3. **AI** — set `GEMINI_API_KEY` or `OPENAI_API_KEY` for live interpretations (mock text used otherwise)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

## Folder Structure

```
app/           → Pages & API routes
components/    → UI primitives + cosmic visuals
lib/           → Astro engine, AI interpreter, DB, Firebase
store/         → Zustand client state
hooks/         → useAuth, etc.
```

## Disclaimer

All AI-generated readings include:

> *This reading is generated for guidance and entertainment purposes only and is not a guaranteed prediction. Astrological calculations are astronomically accurate; interpretations are AI-generated.*

## Roadmap

- **Phase 2:** AI Astrologer chat, numerology, tarot, moon phase, compatibility, notifications
- **Phase 3:** Planet tracker, meditation, premium tier, admin panel
