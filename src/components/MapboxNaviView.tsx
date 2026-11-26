import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '../config';
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

type Point = [number, number];
type Bounds = {
  ne: Point;
  sw: Point;
};

type RouteFeature = {
  type: 'Feature';
  properties: Record<string, never>;
  geometry: {
    type: 'LineString';
    coordinates: Point[];
  };
};

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const defaultCoordinate: Coordinate = { latitude: 40.4531, longitude: -3.6883 };

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

export function MapboxNaviView({ origin, destination, route, height = 320, title, subtitle, liveLabel }: MapboxNaviViewProps) {
  const safeOrigin = useMemo(
    () => origin ?? destination ?? route?.[0] ?? defaultCoordinate,
    [destination, origin, route],
  );
  const safeDestination = useMemo(
    () => destination ?? route?.[route.length - 1] ?? safeOrigin,
    [destination, route, safeOrigin],
  );
  const routeCoords = useMemo(
    () => (route ?? []).filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude)),
    [route],
  );
  const bounds = useMemo(() => {
    const points = routeCoords.length > 1 ? routeCoords : [safeOrigin, safeDestination];
    return buildBounds(points);
  }, [routeCoords, safeDestination, safeOrigin]);
  const routeFeature = useMemo(() => (routeCoords.length > 1 ? buildRouteFeature(routeCoords) : null), [routeCoords]);

  if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'PASTE_YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    return (
      <View style={[styles.mapView, { height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#10192d', borderRadius: 24 }]}>
        <Text style={{ color: '#fff', fontFamily: 'Poppins-SemiBold' }}>Navigation token missing</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'center' }}>Add your navigation token in src/config.ts to enable live routing.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapView, { height, backgroundColor: '#10192d', overflow: 'hidden' }]}>
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={MAPBOX_STYLE_URL}
        logoEnabled
        attributionEnabled
        compassEnabled
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
              paddingTop: 100,
              paddingBottom: 180,
              paddingLeft: 60,
              paddingRight: 60,
            },
            centerCoordinate: toPoint(safeOrigin),
            zoomLevel: 14,
            pitch: 58,
            heading: 12,
            animationMode: 'flyTo',
            animationDuration: 0,
          }}
        />

        {routeFeature ? (
          <Mapbox.ShapeSource id="sfmp-route-source" shape={routeFeature as never}>
            <Mapbox.LineLayer
              id="sfmp-route-shadow"
              style={{
                lineColor: 'rgba(9, 17, 31, 0.42)',
                lineWidth: 10,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Mapbox.LineLayer
              id="sfmp-route-line"
              style={{
                lineColor: '#1d3fb3',
                lineWidth: 6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Mapbox.ShapeSource>
        ) : null}

        <Mapbox.PointAnnotation id="sfmp-origin" coordinate={toPoint(safeOrigin)} title="Origin">
          <View style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: '#1d3fb3', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 10, elevation: 6 }} />
        </Mapbox.PointAnnotation>

        <Mapbox.PointAnnotation id="sfmp-destination" coordinate={toPoint(safeDestination)} title="Destination">
          <View style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: '#c8f36a', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 10, elevation: 6 }} />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>

      <View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, top: 16, backgroundColor: 'rgba(15, 23, 42, 0.92)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
        <Text style={{ color: '#fff', fontFamily: 'Poppins-SemiBold', fontSize: 15 }}>{escapeHtml(title || 'SFMP Navi')}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.82)', fontFamily: 'Poppins-Regular', fontSize: 12, marginTop: 3, lineHeight: 18 }}>{escapeHtml(subtitle || 'Live navigation inside the app')}</Text>
        <View style={{ marginTop: 7, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(200,243,106,0.12)' }}>
          <Text style={{ color: '#c8f36a', fontFamily: 'Poppins-SemiBold', fontSize: 12 }}>{escapeHtml(liveLabel || 'Live navigation')}</Text>
        </View>
      </View>

      <View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 20, elevation: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: '#172033', fontFamily: 'Poppins-SemiBold', fontSize: 12 }}>Live navigation</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#eaf2ff' }}>
            <Text style={{ color: '#1d3fb3', fontFamily: 'Poppins-SemiBold', fontSize: 12 }}>{routeCoords.length > 1 ? 'Route active' : 'Position live'}</Text>
          </View>
        </View>
        <Text style={{ color: '#5a6578', fontFamily: 'Poppins-Regular', fontSize: 12, marginTop: 4, lineHeight: 17 }}>
          {routeCoords.length > 1 ? 'Turn-by-turn styling with a live route, pickup point and destination inside the app.' : 'The map is ready for live pickup and destination navigation.'}
        </Text>
      </View>
    </View>
  );
}

export default MapboxNaviView;
