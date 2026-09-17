declare module 'astronomia/base' {
  export function J2000Century(jde: number): number;
  export class Coord {
    lon: number;
    lat: number;
    range: number;
    constructor(lon?: number, lat?: number, range?: number);
  }
}

declare module 'astronomia/solar' {
  export function apparentLongitude(T: number): number;
}

declare module 'astronomia/moonposition' {
  export function position(jde: number): { lon: number; lat: number; range: number };
}

declare module 'astronomia/planetposition' {
  import type { Coord } from 'astronomia/base';
  export class Planet {
    constructor(planet: object);
    position(jde: number): Coord;
  }
}

declare module 'astronomia/pluto' {
  export function heliocentric(jde: number): { lon: number; lat: number; range: number };
}

declare module 'astronomia/data' {
  const data: {
    earth: object;
    mercury: object;
    venus: object;
    mars: object;
    jupiter: object;
    saturn: object;
    uranus: object;
    neptune: object;
    [key: string]: object;
  };
  export default data;
}
