import { Linking } from 'react-native';

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export function googleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function googleMapsDirectionsUrl(destination: string, origin?: string) {
  const params = new URLSearchParams({ api: '1', destination });
  if (origin) params.set('origin', origin);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function googleMapsEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
}

export function buildRideRouteCoordinates(...points: Array<MapCoordinate | null | undefined>) {
  return points.filter((point): point is MapCoordinate => Boolean(point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude)));
}

export function rideStatusStyle(status?: string | null) {
  switch (status) {
    case 'ACCEPTED':
      return { label: 'En route', backgroundColor: '#dff6ff', color: '#1d3fb3', icon: 'car-sport-outline' as const };
    case 'ARRIVED_AT_PICKUP':
      return { label: 'Arrived', backgroundColor: '#e8f8d4', color: '#3f5b00', icon: 'location-outline' as const };
    case 'IN_PROGRESS':
      return { label: 'Trip in progress', backgroundColor: '#c8f36a', color: '#172033', icon: 'navigate-circle-outline' as const };
    case 'COMPLETED':
      return { label: 'Completed', backgroundColor: '#f4f6f8', color: '#172033', icon: 'checkmark-done-outline' as const };
    case 'REFUSED':
      return { label: 'Refused', backgroundColor: '#fde7ea', color: '#a11f3d', icon: 'close-circle-outline' as const };
    default:
      return { label: 'Pending', backgroundColor: '#f4f6f8', color: '#172033', icon: 'time-outline' as const };
  }
}

export async function openGoogleMapsSearch(query: string) {
  await Linking.openURL(googleMapsSearchUrl(query));
}

export async function openGoogleMapsDirections(destination: string, origin?: string) {
  await Linking.openURL(googleMapsDirectionsUrl(destination, origin));
}
