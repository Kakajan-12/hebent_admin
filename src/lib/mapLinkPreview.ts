function isFiniteCoord(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180 &&
    !(lat === 0 && lon === 0)
  );
}

export function extractLatLonFromMapUrl(raw: string): {
  lat: number;
  lon: number;
} | null {
  if (!raw?.trim()) return null;
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* ignore */
  }

  const hostYandex = /yandex\.(ru|com|by|kz|ua)/i.test(s);

  const m3d = s.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (m3d) {
    const lat = parseFloat(m3d[1]);
    const lon = parseFloat(m3d[2]);
    if (isFiniteCoord(lat, lon)) return { lat, lon };
  }

  const at = s.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)(?:\b|,|\d+z)/);
  if (at) {
    const lat = parseFloat(at[1]);
    const lon = parseFloat(at[2]);
    if (isFiniteCoord(lat, lon)) return { lat, lon };
  }

  const ll = s.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (ll) {
    const a = parseFloat(ll[1]);
    const b = parseFloat(ll[2]);
    if (hostYandex && isFiniteCoord(b, a)) return { lat: b, lon: a };
    if (!hostYandex && isFiniteCoord(a, b)) return { lat: a, lon: b };
  }

  const q = s.match(/[?&]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)(?:&|$)/i);
  if (q) {
    const lat = parseFloat(q[1]);
    const lon = parseFloat(q[2]);
    if (isFiniteCoord(lat, lon)) return { lat, lon };
  }

  return null;
}

export function osmStaticMapThumbUrl(
  lat: number,
  lon: number,
  width = 80,
  height = 56,
): string {
  const w = Math.min(256, Math.max(40, Math.round(width)));
  const h = Math.min(256, Math.max(40, Math.round(height)));
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=${w}x${h}&maptype=mapnik&markers=${lat},${lon},red-pushpin`;
}
