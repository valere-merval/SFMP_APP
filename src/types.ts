import type { AuditCard, BookingCard, EventCard, MobilityCard, MetricCard, OrgCard, UserCard } from './demo';

export type LiveData = {
  events: EventCard[];
  mobility: MobilityCard[];
  bookings: BookingCard[];
  operations: MetricCard[];
  organizations: OrgCard[];
  users: UserCard[];
  audit: AuditCard[];
};
