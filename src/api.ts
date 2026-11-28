import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { RideRequestView, TransportProviderView } from './types';

const API_BASE =
  Platform.select({
    android: 'http://192.168.0.202:8080',
    ios: 'http://192.168.0.202:8080',
    default: 'http://192.168.0.202:8080',
  }) ?? 'http://192.168.0.202:8080';

const TOKEN_KEY = 'sfmp_token';
const USER_KEY = 'sfmp_user';

let authToken = '';
let sessionUser: AuthPayload['user'] | null = null;

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
} | T;

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }

  return payload as T;
}

export async function hydrateAuthToken() {
  const stored = await AsyncStorage.getItem(TOKEN_KEY);
  authToken = stored ?? '';
  const user = await AsyncStorage.getItem(USER_KEY);
  sessionUser = user ? (JSON.parse(user) as AuthPayload['user']) : null;
  return authToken;
}

export function getAuthToken() {
  return authToken;
}

export function getSessionUser() {
  return sessionUser;
}

export function isDriverSession() {
  const role = sessionUser?.role?.toLowerCase() ?? '';
  return role.includes('driver') || role.includes('chauffeur') || role.includes('taxi');
}

export async function setAuthToken(token: string, user?: AuthPayload['user']) {
  authToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  if (user) {
    sessionUser = user;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export async function clearAuthToken() {
  authToken = '';
  sessionUser = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

async function requestJson<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const { skipAuth, ...requestInit } = init ?? {};
  const response = await fetch(`${API_BASE}${path}`, {
    ...requestInit,
    headers: {
      'Content-Type': 'application/json',
      ...(!skipAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(requestInit.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return unwrap(payload);
}

export type AuthPayload = { accessToken: string; user: { fullName: string; role: string; email?: string } };

export type CurrentUser = { id: string; email: string; fullName: string; role: string; organization: string; roles: string[] };

export type UserProfileView = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phonePrefix: string;
  phone: string;
  preferredLanguage: string;
  photoUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type TransportProfileView = {
  id: string;
  ownerEmail: string;
  ownerName: string;
  providerType: string;
  displayName: string;
  driverName: string;
  vehicleLabel: string;
  vehiclePlate: string;
  city: string;
  country: string;
  zone: string;
  permitUrl: string;
  registrationUrl: string;
  driverLicenseUrl: string;
  vehicleImageUrl: string;
  notes: string;
  publicNotes: string;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type TransportAvailabilityView = {
  id: string;
  profileId: string;
  matchId: string;
  matchTitle: string;
  available: boolean;
  ready: boolean;
  status: string;
  notes: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export async function login(email: string, password: string): Promise<AuthPayload> {
  const payload = await requestJson<AuthPayload | { success: boolean; data: AuthPayload }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  const data = unwrap(payload);
  await setAuthToken(data.accessToken, data.user);
  return data;
}

export async function registerAccount(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phone: string;
  preferredLanguage: string;
  phonePrefix: string;
  photoUrl?: string | null;
  accountType?: string;
}): Promise<AuthPayload> {
  const response = await requestJson<AuthPayload>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  await setAuthToken(response.accessToken, response.user);
  return response;
}

export async function resetPassword(payload: { email: string; newPassword: string }): Promise<AuthPayload> {
  const response = await requestJson<AuthPayload>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  await setAuthToken(response.accessToken, response.user);
  return response;
}

export async function currentUser(): Promise<CurrentUser> {
  return requestJson<CurrentUser>('/api/v1/auth/me');
}

export async function loadUserProfile(): Promise<UserProfileView> {
  return requestJson<UserProfileView>('/api/v1/user-profiles/me');
}

export async function saveUserProfile(payload: Omit<UserProfileView, 'email' | 'createdAt' | 'updatedAt'>): Promise<UserProfileView> {
  return putJson<UserProfileView>('/api/v1/user-profiles/me', payload);
}

export async function deleteUserProfile(): Promise<void> {
  await requestJson('/api/v1/user-profiles/me', { method: 'DELETE' });
}

export function getJson<T>(path: string): Promise<T> {
  return requestJson<T>(path);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const payload = await requestJson<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return payload;
}

export async function putJson<T>(path: string, body: unknown): Promise<T> {
  const payload = await requestJson<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return payload;
}

export async function loadTransportProfile(): Promise<TransportProfileView> {
  return requestJson<TransportProfileView>('/api/v1/transport-profiles/me');
}

export async function saveTransportProfile(payload: Omit<TransportProfileView, 'id' | 'ownerEmail' | 'ownerName' | 'createdAt' | 'updatedAt'>): Promise<TransportProfileView> {
  return putJson<TransportProfileView>('/api/v1/transport-profiles/me', payload);
}

export async function loadTransportAvailability(matchId: string): Promise<TransportAvailabilityView> {
  return requestJson<TransportAvailabilityView>(`/api/v1/transport-profiles/me/availability?matchId=${encodeURIComponent(matchId)}`);
}

export async function saveTransportAvailability(matchId: string, payload: { available: boolean }): Promise<TransportAvailabilityView> {
  return postJson<TransportAvailabilityView>(`/api/v1/transport-profiles/me/availability?matchId=${encodeURIComponent(matchId)}`, payload);
}

export async function listPublicTransportProfiles(matchId?: string): Promise<TransportProviderView[]> {
  const suffix = matchId ? `?matchId=${encodeURIComponent(matchId)}` : '';
  return requestJson<TransportProviderView[]>(`/api/v1/transport-profiles/public${suffix}`);
}

export async function listTransportProviders(matchId?: string): Promise<TransportProviderView[]> {
  const suffix = matchId ? `?matchId=${encodeURIComponent(matchId)}` : '';
  return requestJson<TransportProviderView[]>(`/api/v1/transport-providers${suffix}`);
}

export async function createRideRequest(payload: {
  matchId: string;
  matchTitle: string;
  passengerEmail?: string;
  passengerName?: string;
  providerType: string;
  pickupLabel: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  destinationLabel: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  note?: string;
}): Promise<RideRequestView> {
  return postJson<RideRequestView>('/api/v1/ride-requests', payload);
}

export async function listPassengerRideRequests(passengerEmail?: string): Promise<RideRequestView[]> {
  const suffix = passengerEmail ? `?passengerEmail=${encodeURIComponent(passengerEmail)}` : '';
  return requestJson<RideRequestView[]>(`/api/v1/ride-requests/me${suffix}`);
}

export async function getRideRequest(id: string): Promise<RideRequestView> {
  return requestJson<RideRequestView>(`/api/v1/ride-requests/${encodeURIComponent(id)}`);
}

export async function listDriverRideRequests(matchId: string, providerType: string): Promise<RideRequestView[]> {
  return requestJson<RideRequestView[]>(
    `/api/v1/ride-requests/driver?matchId=${encodeURIComponent(matchId)}&providerType=${encodeURIComponent(providerType)}`,
  );
}

export async function listAssignedDriverRideRequests(driverProfileId?: string): Promise<RideRequestView[]> {
  const suffix = driverProfileId ? `?driverProfileId=${encodeURIComponent(driverProfileId)}` : '';
  return requestJson<RideRequestView[]>(`/api/v1/ride-requests/driver/assigned${suffix}`);
}

export async function acceptRideRequest(
  id: string,
  payload?: {
    driverProfileId?: string;
    driverDisplayName?: string;
    driverPhone?: string;
    driverVehiclePlate?: string;
    driverLatitude?: number | null;
    driverLongitude?: number | null;
    driverDistanceKm?: number | null;
    driverEtaMinutes?: number | null;
    responseNote?: string;
  },
): Promise<RideRequestView> {
  return postJson<RideRequestView>(`/api/v1/ride-requests/${encodeURIComponent(id)}/accept`, payload ?? {});
}

export async function refuseRideRequest(id: string, responseNote?: string): Promise<RideRequestView> {
  return postJson<RideRequestView>(`/api/v1/ride-requests/${encodeURIComponent(id)}/refuse`, { responseNote });
}

export async function markRideRequestArrived(id: string): Promise<RideRequestView> {
  return postJson<RideRequestView>(`/api/v1/ride-requests/${encodeURIComponent(id)}/arrive`, {});
}

export async function startRideRequestTrip(id: string): Promise<RideRequestView> {
  return postJson<RideRequestView>(`/api/v1/ride-requests/${encodeURIComponent(id)}/start`, {});
}

export async function completeRideRequestTrip(id: string): Promise<RideRequestView> {
  return postJson<RideRequestView>(`/api/v1/ride-requests/${encodeURIComponent(id)}/complete`, {});
}


export async function uploadImageBase64(file: { name: string; type: string; base64: string }): Promise<{ key: string; url: string }> {
  return requestJson<{ key: string; url: string }>('/api/v1/uploads/images/base64', {
    method: 'POST',
    body: JSON.stringify(file),
  });
}

export async function uploadDocument(file: { uri: string; name: string; type: string }): Promise<{ key: string; url: string }> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const headers: Record<string, string> = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}/api/v1/uploads/images`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  const payload = (await response.json()) as { success?: boolean; data?: { key: string; url: string } };
  if (!payload.data) {
    throw new Error('Empty upload response');
  }

  return payload.data;
}
