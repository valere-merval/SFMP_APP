import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '../config';
import { styles } from '../ui';

type MapboxModule = typeof import('@rnmapbox/maps');
let cachedMapbox: MapboxModule | null | undefined;

function getMapbox(): MapboxModule | null {
  if (cachedMapbox !== undefined) {
    return cachedMapbox;
  }

  try {
    const loaded = require('@rnmapbox/maps') as MapboxModule;
    loaded.setAccessToken(MAPBOX_ACCESS_TOKEN);
    cachedMapbox = loaded;
    return loaded;
  } catch (error) {
    console.warn('Mapbox navigation unavailable, falling back to static preview.', error);
    cachedMapbox = null;
    return null;
  }
}

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
  compactChrome?: boolean;
};

type Point = [number, number];
type Bounds = { ne: Point; sw: Point };

type RouteFeature = {
  type: 'Feature';
  properties: Record<string, never>;
  geometry: {
    type: 'LineString';
    coordinates: Point[];
  };
};


function escapeHtml(input: string) {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function toPoint(coordinate: Coordinate): Point {
  return [coordinate.longitude, coordinate.latitude];
}

function buildBounds(points: Coordinate[]): Bounds {
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  return {
    sw: [Math.min(...longitudes), Math.min(...latitudes)],
    ne: [Math.max(...longitudes), Math.max(...latitudes)],
  };
}

function buildRouteFeature(route: Coordinate[]): RouteFeature {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route.map(toPoint),
    },
  };
}

export function MapboxNaviView({ origin, destination, route, height = 600, title, subtitle, liveLabel, compactChrome = true }: MapboxNaviViewProps) {
  const safeOrigin = useMemo(() => origin ?? destination ?? route?.[0] ?? null, [destination, origin, route]);
  const safeDestination = useMemo(() => destination ?? route?.[route.length - 1] ?? safeOrigin, [destination, route, safeOrigin]);
  const routeCoords = useMemo(
    () => (route ?? []).filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude)),
    [route],
  );
  const bounds = useMemo(() => {
    const points = routeCoords.length > 1 ? routeCoords : safeOrigin && safeDestination ? [safeOrigin, safeDestination] : [];
    return points.length > 0 ? buildBounds(points as Coordinate[]) : null;
  }, [routeCoords, safeDestination, safeOrigin]);
  const routeFeature = useMemo(() => (routeCoords.length > 1 ? buildRouteFeature(routeCoords) : null), [routeCoords]);
  const Mapbox = getMapbox();

  if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'PASTE_YOUR_MAPBOX_ACCESS_TOKEN_HERE' || !Mapbox) {
    return (
      <View style={[naviStyles.fallback, { height }]}>
        <Text style={naviStyles.fallbackTitle}>Navigation unavailable</Text>
        <Text style={naviStyles.fallbackSubtitle}>Waiting for the live position needed to start guidance.</Text>
      </View>
    );
  }

  if (!safeOrigin || !safeDestination || !bounds) {
    return (
      <View style={[naviStyles.fallback, { height }]}>
        <Text style={naviStyles.fallbackTitle}>Navigation pending</Text>
        <Text style={naviStyles.fallbackSubtitle}>Waiting for the live position needed to start guidance.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapPanel, naviStyles.container, { height }]}> 
      <Mapbox.MapView
        style={naviStyles.mapView}
        styleURL={MAPBOX_STYLE_URL}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
        scaleBarEnabled={false}
        pitchEnabled
        rotateEnabled
        scrollEnabled
        zoomEnabled
      >
        <Mapbox.Camera
          defaultSettings={{
            bounds: {
              ne: bounds.ne,
              sw: bounds.sw,
              paddingTop: 180,
              paddingBottom: 180,
              paddingLeft: 90,
              paddingRight: 90,
            },
            centerCoordinate: toPoint(safeOrigin!),
            zoomLevel: 14.3,
            pitch: 58,
            heading: 12,
            animationMode: 'flyTo',
            animationDuration: 0,
          }}
        />

        {routeFeature ? (
          <Mapbox.ShapeSource id="sfmp-route-source" shape={routeFeature as never}>
            <Mapbox.LineLayer id="sfmp-route-shadow" style={routeShadowStyle as never} />
            <Mapbox.LineLayer id="sfmp-route-line" style={routeLineStyle as never} />
          </Mapbox.ShapeSource>
        ) : null}

        <Mapbox.PointAnnotation id="sfmp-origin" coordinate={toPoint(safeOrigin!)} title="Origin">
          <View style={naviStyles.originMarker} />
        </Mapbox.PointAnnotation>

        <Mapbox.PointAnnotation id="sfmp-destination" coordinate={toPoint(safeDestination!)} title="Destination">
          <View style={naviStyles.destinationMarker} />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>

      <View pointerEvents="none" style={naviStyles.overlay}>
        <View style={compactChrome ? naviStyles.overlayShellMinimal : naviStyles.overlayShell}>
          <View style={naviStyles.overlayRow}>
            <View style={naviStyles.overlayTextBlock}>
              <View style={naviStyles.liveBadge}>
                <Text style={naviStyles.liveBadgeText}>{escapeHtml(liveLabel || 'Live')}</Text>
              </View>
              {!compactChrome && title ? (
                <Text style={naviStyles.overlayTitle} numberOfLines={1} ellipsizeMode="tail">
                  {escapeHtml(title)}
                </Text>
              ) : null}
              {!compactChrome && subtitle ? (
                <Text style={naviStyles.overlaySubtitle} numberOfLines={1} ellipsizeMode="tail">
                  {escapeHtml(subtitle)}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const routeShadowStyle = {
  lineColor: 'rgba(9, 17, 31, 0.24)',
  lineWidth: 11,
  lineCap: 'round',
  lineJoin: 'round',
} as const;

const routeLineStyle = {
  lineColor: '#00e5ff',
  lineWidth: 6.5,
  lineCap: 'round',
  lineJoin: 'round',
} as const;

const naviStyles = StyleSheet.create({
  container: { backgroundColor: 'rgba(9, 17, 31, 0.08)' },
  mapView: { flex: 1 },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 18, 32, 0.2)',
    borderRadius: 32,
    paddingHorizontal: 20,
  },
  fallbackTitle: { color: '#f8fbff', fontFamily: 'Poppins-SemiBold' },
  fallbackSubtitle: { color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'center', maxWidth: 280, fontFamily: 'Poppins-Regular' },
  originMarker: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#00e5ff',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  destinationMarker: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#ccff00',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  overlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 12,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  overlayShell: {
    gap: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(8, 15, 27, 0.012)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.015)',
  },
  overlayShellCompact: {
    backgroundColor: 'rgba(8, 15, 27, 0.005)',
    borderColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  overlayShellMinimal: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  overlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  overlayTextBlock: {
    flex: 1,
    gap: 4,
  },
  overlayTitle: { color: '#f8fbff', fontFamily: 'Poppins-SemiBold', fontSize: 11.5, flexShrink: 1 },
  overlaySubtitle: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins-Regular', fontSize: 10.5, flexShrink: 1 },
  liveBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(0,229,255,0.08)',
  },
  liveBadgeText: { color: '#9df5ff', fontFamily: 'Poppins-SemiBold', fontSize: 9.5 },
});

export default MapboxNaviView;
