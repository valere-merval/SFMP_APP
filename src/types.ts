import type { AuditCard, BookingCard, ConsentView, ContextualMessageView, DemandPeakView, EventCard, HeatmapView, InsightView, MobilityCard, MetricCard, OrgCard, RoadmapView, RouteAdaptationView, TrafficView, UserCard } from './demo';

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
  traffic: TrafficView[];
  consents: ConsentView[];
  insights: InsightView[];
};
