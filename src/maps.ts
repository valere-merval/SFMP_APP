import { Linking } from 'react-native';
import type { Locale } from './i18n';

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

const STATUS_LABELS: Record<Locale, Record<string, string>> = {
  en: { ACCEPTED: 'En route', ARRIVED_AT_PICKUP: 'Arrived', IN_PROGRESS: 'Trip in progress', COMPLETED: 'Completed', REFUSED: 'Refused', PENDING: 'Pending' },
  fr: { ACCEPTED: 'En route', ARRIVED_AT_PICKUP: 'Arrivé', IN_PROGRESS: 'Trajet en cours', COMPLETED: 'Terminé', REFUSED: 'Refusé', PENDING: 'En attente' },
  de: { ACCEPTED: 'Unterwegs', ARRIVED_AT_PICKUP: 'Angekommen', IN_PROGRESS: 'Fahrt läuft', COMPLETED: 'Abgeschlossen', REFUSED: 'Abgelehnt', PENDING: 'Ausstehend' },
  es: { ACCEPTED: 'En camino', ARRIVED_AT_PICKUP: 'Llegó', IN_PROGRESS: 'Viaje en curso', COMPLETED: 'Completado', REFUSED: 'Rechazado', PENDING: 'Pendiente' },
  pt: { ACCEPTED: 'A caminho', ARRIVED_AT_PICKUP: 'Chegou', IN_PROGRESS: 'Viagem em andamento', COMPLETED: 'Concluído', REFUSED: 'Recusado', PENDING: 'Pendente' },
  ar: { ACCEPTED: 'في الطريق', ARRIVED_AT_PICKUP: 'وصل', IN_PROGRESS: 'الرحلة جارية', COMPLETED: 'مكتمل', REFUSED: 'مرفوض', PENDING: 'قيد الانتظار' },
  zh: { ACCEPTED: '前往中', ARRIVED_AT_PICKUP: '已到达', IN_PROGRESS: '行程进行中', COMPLETED: '已完成', REFUSED: '已拒绝', PENDING: '待处理' },
  ru: { ACCEPTED: 'В пути', ARRIVED_AT_PICKUP: 'Прибыл', IN_PROGRESS: 'Поездка в процессе', COMPLETED: 'Завершено', REFUSED: 'Отклонено', PENDING: 'Ожидание' },
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

export function rideStatusStyle(status?: string | null, locale: Locale = 'en') {
  const labels = STATUS_LABELS[locale] ?? STATUS_LABELS.en;
  switch (status) {
    case 'ACCEPTED':
      return { label: labels.ACCEPTED, backgroundColor: '#dff6ff', color: '#1d3fb3', icon: 'car-sport-outline' as const };
    case 'ARRIVED_AT_PICKUP':
      return { label: labels.ARRIVED_AT_PICKUP, backgroundColor: '#e8f8d4', color: '#3f5b00', icon: 'location-outline' as const };
    case 'IN_PROGRESS':
      return { label: labels.IN_PROGRESS, backgroundColor: '#c8f36a', color: '#172033', icon: 'navigate-circle-outline' as const };
    case 'COMPLETED':
      return { label: labels.COMPLETED, backgroundColor: '#f4f6f8', color: '#172033', icon: 'checkmark-done-outline' as const };
    case 'REFUSED':
      return { label: labels.REFUSED, backgroundColor: '#fde7ea', color: '#a11f3d', icon: 'close-circle-outline' as const };
    default:
      return { label: labels.PENDING, backgroundColor: '#f4f6f8', color: '#172033', icon: 'time-outline' as const };
  }
}

export async function openGoogleMapsSearch(query: string) {
  await Linking.openURL(googleMapsSearchUrl(query));
}

export async function openGoogleMapsDirections(destination: string, origin?: string) {
  await Linking.openURL(googleMapsDirectionsUrl(destination, origin));
}
