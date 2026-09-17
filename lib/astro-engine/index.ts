import { J2000Century } from 'astronomia/base';
import { apparentLongitude } from 'astronomia/solar';
import { position as moonPosition } from 'astronomia/moonposition';
import { Planet } from 'astronomia/planetposition';
import { heliocentric as plutoHeliocentric } from 'astronomia/pluto';
import data from 'astronomia/data';
import type { ZodiacSign } from '../constants';
import {
  toJulianDay,
  longitudeToSign,
  formatDegree,
  calculateAscendant,
  calculateHouses,
  moonToNakshatra,
} from './utils';

export interface BirthInput {
  dob: string;
  birthTime: string;
  lat: number;
  lng: number;
  tzOffset: number;
}

export interface PlanetPosition {
  planet: string;
  longitude: number;
  sign: ZodiacSign;
  degreeFormatted: string;
  retrograde?: boolean;
}

export interface CalculatedChart {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  ascendant: ZodiacSign;
  ascendantDegree: string;
  nakshatra: string;
  houses: { house: number; cusp: number; sign: ZodiacSign }[];
  planetPositions: PlanetPosition[];
  calculatedAt: string;
}

function birthToUtcDate(input: BirthInput): Date {
  const [year, month, day] = input.dob.split('-').map(Number);
  const [hours, minutes] = input.birthTime.split(':').map(Number);
  const utcMs =
    Date.UTC(year, month - 1, day, hours, minutes) - input.tzOffset * 60 * 60 * 1000;
  return new Date(utcMs);
}

function toCartesian(lon: number, lat: number, range: number) {
  const cosLat = Math.cos(lat);
  return {
    x: range * cosLat * Math.cos(lon),
    y: range * cosLat * Math.sin(lon),
    z: range * Math.sin(lat),
  };
}

function cartesianToLongitude(x: number, y: number, z: number): number {
  const lon = Math.atan2(y, x);
  return ((lon * 180) / Math.PI + 360) % 360;
}

function geocentricLongitude(
  jd: number,
  helioLon: number,
  helioLat: number,
  helioRange: number,
  earthLon: number,
  earthLat: number,
  earthRange: number
): number {
  const planet = toCartesian(helioLon, helioLat, helioRange);
  const earth = toCartesian(earthLon, earthLat, earthRange);
  const x = planet.x - earth.x;
  const y = planet.y - earth.y;
  const z = planet.z - earth.z;
  return cartesianToLongitude(x, y, z);
}

const earthPlanet = new Planet(data.earth);

const PLANET_DATA: Record<string, keyof typeof data> = {
  Mercury: 'mercury',
  Venus: 'venus',
  Mars: 'mars',
  Jupiter: 'jupiter',
  Saturn: 'saturn',
  Uranus: 'uranus',
  Neptune: 'neptune',
};

function getPlanetLongitude(planetName: string, jd: number): number {
  const T = J2000Century(jd);

  if (planetName === 'Sun') {
    const lon = apparentLongitude(T);
    return ((lon * 180) / Math.PI + 360) % 360;
  }

  if (planetName === 'Moon') {
    const pos = moonPosition(jd);
    return ((pos.lon * 180) / Math.PI + 360) % 360;
  }

  const earthPos = earthPlanet.position(jd);

  if (planetName === 'Pluto') {
    const pluto = plutoHeliocentric(jd);
    return geocentricLongitude(
      jd,
      pluto.lon,
      pluto.lat,
      pluto.range,
      earthPos.lon,
      earthPos.lat,
      earthPos.range
    );
  }

  const key = PLANET_DATA[planetName];
  if (!key) return 0;

  const planet = new Planet(data[key]);
  const pos = planet.position(jd);
  return geocentricLongitude(
    jd,
    pos.lon,
    pos.lat,
    pos.range,
    earthPos.lon,
    earthPos.lat,
    earthPos.range
  );
}

const PLANET_NAMES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];

export function calculateBirthChart(input: BirthInput): CalculatedChart {
  const utcDate = birthToUtcDate(input);
  const jd = toJulianDay(utcDate);

  const planetPositions: PlanetPosition[] = PLANET_NAMES.map((planet) => {
    const longitude = getPlanetLongitude(planet, jd);
    return {
      planet,
      longitude,
      sign: longitudeToSign(longitude),
      degreeFormatted: formatDegree(longitude),
    };
  });

  const sunLon = planetPositions.find((p) => p.planet === 'Sun')!.longitude;
  const moonLon = planetPositions.find((p) => p.planet === 'Moon')!.longitude;
  const ascLon = calculateAscendant(jd, input.lat, input.lng);

  return {
    sunSign: longitudeToSign(sunLon),
    moonSign: longitudeToSign(moonLon),
    ascendant: longitudeToSign(ascLon),
    ascendantDegree: formatDegree(ascLon),
    nakshatra: moonToNakshatra(moonLon),
    houses: calculateHouses(ascLon),
    planetPositions,
    calculatedAt: utcDate.toISOString(),
  };
}

export function getSunSignForDate(dateStr: string): ZodiacSign {
  const [year, month, day] = dateStr.split('-').map(Number);
  const jd = toJulianDay(new Date(Date.UTC(year, month - 1, day, 12, 0)));
  const T = J2000Century(jd);
  const lon = apparentLongitude(T);
  const longitude = ((lon * 180) / Math.PI + 360) % 360;
  return longitudeToSign(longitude);
}
