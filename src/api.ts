import { Platform } from 'react-native';

const API_BASE = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
});

export async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) return fallback;
    const payload = (await response.json()) as { success?: boolean; data?: T };
    return payload?.data ?? fallback;
  } catch {
    return fallback;
  }
}
