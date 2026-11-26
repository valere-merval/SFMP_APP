import React, { useMemo } from 'react';
import { Platform, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_CSS_CDN, MAPBOX_JS_CDN, MAPBOX_STYLE_URL } from '../config';
import { styles } from '../ui';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type MapboxNaviViewProps = {
  origin?: Coordinate | null;
  destination?: Coordinate | null;
  route?: Coordinate[];
  height?: number;
  title?: string;
  subtitle?: string;
  liveLabel?: string;
};

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml(token: string, props: Required<Pick<MapboxNaviViewProps, 'origin' | 'destination'>> & Pick<MapboxNaviViewProps, 'route' | 'title' | 'subtitle' | 'liveLabel'>) {
  const route = (props.route ?? []).filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
  const payload = {
    origin: props.origin,
    destination: props.destination,
    route,
    title: props.title ?? '',
    subtitle: props.subtitle ?? '',
    liveLabel: props.liveLabel ?? 'Live navigation',
  };

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
    <script src="${MAPBOX_JS_CDN}"></script>
    <link href="${MAPBOX_CSS_CDN}" rel="stylesheet" />
    <style>
      html, body, #map { margin: 0; width: 100%; height: 100%; background: #0d1322; }
      body { overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .badge { position: absolute; left: 16px; right: 16px; top: 16px; z-index: 2; background: rgba(15, 23, 42, 0.92); color: #fff; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 12px 14px; backdrop-filter: blur(8px); }
      .title { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
      .subtitle { font-size: 12px; opacity: 0.82; line-height: 1.35; }
      .live { margin-top: 7px; display: inline-flex; align-items: center; gap: 6px; color: #c8f36a; font-size: 12px; font-weight: 700; }
      .live::before { content: ''; width: 8px; height: 8px; border-radius: 999px; background: #c8f36a; display: inline-block; box-shadow: 0 0 0 8px rgba(200,243,106,0.12); }
      .legend { position: absolute; left: 16px; right: 16px; bottom: 16px; z-index: 2; background: rgba(255,255,255,0.94); color: #172033; border-radius: 18px; padding: 10px 12px; box-shadow: 0 12px 28px rgba(0,0,0,0.24); }
      .row { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
      .pill { padding: 5px 10px; border-radius: 999px; background: #eaf2ff; color: #1d3fb3; font-weight: 700; white-space: nowrap; }
      .muted { color: #5a6578; margin-top: 4px; font-size: 12px; line-height: 1.35; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="badge">
      <div class="title">${escapeHtml(payload.title || 'SFMP Navi')}</div>
      <div class="subtitle">${escapeHtml(payload.subtitle || 'Live navigation inside the app')}</div>
      <div class="live">${escapeHtml(payload.liveLabel)}</div>
    </div>
    <div class="legend">
      <div class="row"><strong>Mapbox</strong><span class="pill">${route.length > 1 ? 'Route active' : 'Position live'}</span></div>
      <div class="muted">${route.length > 1 ? 'Turn-by-turn route rendered from the provided coordinates.' : 'Use the destination point to show live guidance and handoff.'}</div>
    </div>
    <script>
      mapboxgl.accessToken = ${JSON.stringify(token)};
      const payload = ${JSON.stringify(payload)};
      const map = new mapboxgl.Map({
        container: 'map',
        style: ${JSON.stringify(MAPBOX_STYLE_URL)},
        center: [payload.origin.longitude, payload.origin.latitude],
        zoom: 13.5,
        pitch: 58,
        bearing: 12,
        antialias: true,
      });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

      const bounds = new mapboxgl.LngLatBounds();
      const addPoint = (coordinate, color, label) => {
        if (!coordinate) return;
        bounds.extend([coordinate.longitude, coordinate.latitude]);
        const el = document.createElement('div');
        el.style.width = '18px';
        el.style.height = '18px';
        el.style.borderRadius = '999px';
        el.style.background = color;
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 8px 18px rgba(0,0,0,0.28)';
        new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([coordinate.longitude, coordinate.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(label))
          .addTo(map);
      };

      map.on('load', () => {
        addPoint(payload.origin, '#1d3fb3', 'Origin');
        addPoint(payload.destination, '#c8f36a', 'Destination');
        if (payload.route.length > 1) {
          const coordinates = payload.route.map((point) => [point.longitude, point.latitude]);
          bounds.extend(coordinates[0]);
          bounds.extend(coordinates[coordinates.length - 1]);
          map.addSource('sfmp-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates },
            },
          });
          map.addLayer({
            id: 'sfmp-route-shadow',
            type: 'line',
            source: 'sfmp-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': 'rgba(9, 17, 31, 0.42)', 'line-width': 10 },
          });
          map.addLayer({
            id: 'sfmp-route-line',
            type: 'line',
            source: 'sfmp-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#1d3fb3', 'line-width': 6 },
          });
        }
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 80, duration: 0 });
        }
      });
    </script>
  </body>
</html>`;
}

export function MapboxNaviView({ origin, destination, route, height = 320, title, subtitle, liveLabel }: MapboxNaviViewProps) {
  const safeOrigin = useMemo(
    () => origin ?? destination ?? route?.[0] ?? { latitude: 40.4531, longitude: -3.6883 },
    [origin, destination, route],
  );
  const safeDestination = useMemo(
    () => destination ?? route?.[route.length - 1] ?? safeOrigin,
    [destination, route, safeOrigin],
  );
  const html = useMemo(() => buildHtml(MAPBOX_ACCESS_TOKEN, { origin: safeOrigin, destination: safeDestination, route, title, subtitle, liveLabel }), [safeDestination, route, safeOrigin, subtitle, title, liveLabel]);
  if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'PASTE_YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    return (
      <View style={[styles.mapView, { height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#10192d', borderRadius: 24 }]}>
        <Text style={{ color: '#fff', fontFamily: 'Poppins-SemiBold' }}>Mapbox token missing</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'center' }}>Set MAPBOX_ACCESS_TOKEN in src/config.ts to enable the live Navi.</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ html }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      bounces={false}
      style={[styles.mapView, { height, backgroundColor: '#10192d' }]}
      setSupportMultipleWindows={false}
      androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
      allowsInlineMediaPlayback
    />
  );
}

export default MapboxNaviView;
