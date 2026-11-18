import type { AuditCard, BookingCard, ContextualMessageView, DemandPeakView, EventCard, HeatmapView, MobilityCard, MetricCard, OrgCard, RoadmapView, RouteAdaptationView, UserCard } from './demo';

export type LiveData = {
  events: EventCard[];
  mobility: MobilityCard[];
  bookings: BookingCard[];
  operations: MetricCard[];
  organizations: OrgCard[];
  users: UserCard[];
  audit: AuditCard[];
  roadmap: RoadmapView[];
  heatmaps: HeatmapView[];
  demandPeaks: DemandPeakView[];
  routeAdaptations: RouteAdaptationView[];
  contextualMessages: ContextualMessageView[];
};
