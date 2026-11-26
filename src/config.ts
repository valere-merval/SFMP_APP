// Put your Mapbox token in Vite env: VITE_MAPBOX_ACCESS_TOKEN
// Optional: override the navigation style in VITE_MAPBOX_STYLE_URL.
const mapboxEnv = import.meta as any;

export const MAPBOX_STYLE_URL =
  mapboxEnv.env?.VITE_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/navigation-night-v1';

export const MAPBOX_ACCESS_TOKEN =
  mapboxEnv.env?.VITE_MAPBOX_ACCESS_TOKEN || 'PASTE_YOUR_MAPBOX_ACCESS_TOKEN_HERE';
