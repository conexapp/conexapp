export const ROSARIO = { lat: -32.944242, lng: -60.650539 };

/** Bounding box used to reject points outside the Rosario operating area. */
export const ROSARIO_BOUNDS = {
  minLat: -33.2,
  maxLat: -32.7,
  minLng: -60.9,
  maxLng: -60.4,
};

export type LocationVisibility = "exact" | "approximate";

export function insideRosario(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= ROSARIO_BOUNDS.minLat &&
    lat <= ROSARIO_BOUNDS.maxLat &&
    lng >= ROSARIO_BOUNDS.minLng &&
    lng <= ROSARIO_BOUNDS.maxLng
  );
}

/**
 * Public pin. "approximate" is the center of the ~1.1 km cell that contains
 * the stored point. It is not a new place and it is not the exact coordinate.
 */
export function publicCoordinate(
  lat: number,
  lng: number,
  visibility: LocationVisibility,
): { lat: number; lng: number } {
  if (visibility !== "approximate") return { lat, lng };
  const step = 0.01;
  return {
    lat: Math.floor(lat / step) * step + step / 2,
    lng: Math.floor(lng / step) * step + step / 2,
  };
}

export type GeocodeHit = { label: string; lat: number; lng: number };

/** Keep Nominatim rows that fall inside Rosario. Anything else is discarded. */
export function nominatimHitsInRosario(rows: unknown): GeocodeHit[] {
  if (!Array.isArray(rows)) return [];
  const hits: GeocodeHit[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as { display_name?: unknown; lat?: unknown; lon?: unknown };
    const lat = Number(record.lat);
    const lng = Number(record.lon);
    const label = typeof record.display_name === "string" ? record.display_name.trim() : "";
    if (!label || !insideRosario(lat, lng)) continue;
    hits.push({ label, lat, lng });
  }
  return hits;
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}
