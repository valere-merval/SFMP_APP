import { Platform } from 'react-native';

const API_BASE =
  Platform.select({
    android: 'http://10.0.2.2:8080',
    ios: 'http://localhost:8080',
    default: 'http://localhost:8080',
  }) ?? 'http://localhost:8080';

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

export function setAuthToken(token: string) {
  authToken = token;
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

export async function login(username: string, password: string): Promise<{ accessToken: string; user: { fullName: string; role: string } }> {
  const payload = await requestJson<{ accessToken: string; user: { fullName: string; role: string } } | { success: boolean; data: { accessToken: string; user: { fullName: string; role: string } } }>(
    '/api/v1/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    },
  );
  const data = unwrap(payload);
  authToken = data.accessToken;
  return data;
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
