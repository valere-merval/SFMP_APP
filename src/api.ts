import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE =
  Platform.select({
    android: 'http://10.0.2.2:8080',
    ios: 'http://localhost:8080',
    default: 'http://localhost:8080',
  }) ?? 'http://localhost:8080';

const TOKEN_KEY = 'sfmp_token';

let authToken = '';

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
  return authToken;
}

export function getAuthToken() {
  return authToken;
}

export async function setAuthToken(token: string) {
  authToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAuthToken() {
  authToken = '';
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {}),
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

export async function login(email: string, password: string): Promise<AuthPayload> {
  const payload = await requestJson<AuthPayload | { success: boolean; data: AuthPayload }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = unwrap(payload);
  await setAuthToken(data.accessToken);
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
  accountType?: string;
}): Promise<AuthPayload> {
  const response = await requestJson<AuthPayload>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await setAuthToken(response.accessToken);
  return response;
}

export async function resetPassword(payload: { email: string; newPassword: string }): Promise<AuthPayload> {
  const response = await requestJson<AuthPayload>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await setAuthToken(response.accessToken);
  return response;
}

export async function currentUser(): Promise<CurrentUser> {
  return requestJson<CurrentUser>('/api/v1/auth/me');
}

export function getJson<T>(path: string): Promise<T> {
  return requestJson<T>(path);
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
