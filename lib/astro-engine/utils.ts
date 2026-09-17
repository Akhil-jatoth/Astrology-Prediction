import { ZODIAC_SIGNS, type ZodiacSign } from '../constants';

/** Convert ecliptic longitude (0–360°) to tropical zodiac sign */
export function longitudeToSign(longitude: number): ZodiacSign {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[index];
}

/** Degree within sign (0–29.99) */
export function longitudeToDegreeInSign(longitude: number): number {
  const normalized = ((longitude % 360) + 360) % 360;
  return normalized % 30;
}

export function formatDegree(longitude: number): string {
  const deg = Math.floor(longitudeToDegreeInSign(longitude));
  const min = Math.floor((longitudeToDegreeInSign(longitude) - deg) * 60);
  const sign = longitudeToSign(longitude);
  const signName = sign.charAt(0).toUpperCase() + sign.slice(1);
  return `${deg}°${min.toString().padStart(2, '0')}' ${signName}`;
}

/** Julian Day from UTC Date */
export function toJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let Y = y;
  let M = m;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5;
}

/** Local Sidereal Time in degrees */
export function localSiderealTime(jd: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525;
  let theta =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  theta = ((theta % 360) + 360) % 360;
  return ((theta + longitude) % 360 + 360) % 360;
}

/** Ascendant longitude (simplified Placidus approximation using RAMC) */
export function calculateAscendant(jd: number, lat: number, lng: number): number {
  const lst = localSiderealTime(jd, lng);
  const latRad = (lat * Math.PI) / 180;
  const lstRad = (lst * Math.PI) / 180;

  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(latRad) + Math.tan((23.4392911 * Math.PI) / 180) * Math.sin(latRad);

  let asc = (Math.atan2(y, x) * 180) / Math.PI;
  asc = ((asc % 360) + 360) % 360;
  return asc;
}

/** Equal house cusps from ascendant */
export function calculateHouses(ascendant: number): { house: number; cusp: number; sign: ZodiacSign }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const cusp = (ascendant + i * 30) % 360;
    return {
      house: i + 1,
      cusp,
      sign: longitudeToSign(cusp),
    };
  });
}

/** Vedic nakshatra from moon longitude (sidereal approximation: subtract ~24° ayanamsa) */
const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

export function moonToNakshatra(moonLongitude: number): string {
  const ayanamsa = 24.1; // Lahiri approximation
  const sidereal = ((moonLongitude - ayanamsa) % 360 + 360) % 360;
  const index = Math.floor(sidereal / (360 / 27));
  return NAKSHATRAS[Math.min(index, 26)];
}
