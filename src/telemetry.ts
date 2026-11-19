import { postJson } from './api';

type TelemetryPayload = {
  userId?: string;
  eventType: string;
  screen: string;
  payload?: Record<string, unknown>;
};

export function trackTelemetry(eventType: string, screen: string, payload?: Record<string, unknown>) {
  postJson('/api/v1/telemetry/events', {
    userId: 'authenticated-user',
    eventType,
    screen,
    payload: payload ?? {},
  } satisfies TelemetryPayload).then(() => undefined).catch(() => undefined);
}
