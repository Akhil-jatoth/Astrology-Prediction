export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  tzOffset: number;
}

/** Geocode via Open-Meteo (free, no API key) + timezone lookup */
export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );

    if (!geoRes.ok) return [];
    const geoData = await geoRes.json();
    const results = geoData.results ?? [];

    const enriched = await Promise.all(
      results.map(async (r: { name: string; latitude: number; longitude: number; country?: string; admin1?: string }) => {
        let tzOffset = 0;

        try {
          const tzRes = await fetch(
            `https://timeapi.io/api/TimeZone/coordinate?latitude=${r.latitude}&longitude=${r.longitude}`
          );
          if (tzRes.ok) {
            const tzData = await tzRes.json();
            const match = tzData.currentUtcOffset?.match(/([+-])(\d{2}):(\d{2})/);
            if (match) {
              const sign = match[1] === '+' ? 1 : -1;
              tzOffset = sign * (parseInt(match[2], 10) + parseInt(match[3], 10) / 60);
            }
          }
        } catch {
          tzOffset = 0;
        }

        const label = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
        return { name: label, lat: r.latitude, lng: r.longitude, tzOffset };
      })
    );

    return enriched;
  } catch {
    return [];
  }
}
