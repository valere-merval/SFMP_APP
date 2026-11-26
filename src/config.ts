// Put your Mapbox token in the app environment or replace the fallback below.
// Optional: override the navigation style with MAPBOX_STYLE_URL.
const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}) as Record<string, string | undefined>;

export const MAPBOX_STYLE_URL =
  env.MAPBOX_STYLE_URL || env.RN_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/navigation-night-v1';

export const MAPBOX_ACCESS_TOKEN =
  env.MAPBOX_ACCESS_TOKEN || env.RN_MAPBOX_ACCESS_TOKEN || 'PASTE_YOUR_MAPBOX_ACCESS_TOKEN_HERE';
