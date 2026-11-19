export type EventCard = {
  id: string;
  title: string;
  city: string;
  venue: string;
  date: string;
  status: string;
  attendance: string;
};

export type MobilityCard = {
  id: string;
  mode: string;
  duration: string;
  price: string;
  badge: string;
};

export type BookingCard = {
  id: string;
  fanName: string;
  option: string;
  time: string;
  status: string;
};

export type MetricCard = {
  id: string;
  label: string;
  value: string;
  trend: string;
};

export type OrgCard = {
  id: string;
  name: string;
  type: string;
  status: string;
};

export type UserCard = {
  id: string;
  name: string;
  role: string;
  org: string;
  status: string;
};

export type AuditCard = {
  id: string;
  action: string;
  actor: string;
  resource: string;
};

export type IntegrationView = {
  id: string;
  name: string;
  status: string;
  endpoint: string;
};

export type RoadmapView = {
  version: string;
  title: string;
  features: string[];
};

export type HeatmapView = {
  zone: string;
  intensity: string;
  trend: string;
  recommendation: string;
};

export type DemandPeakView = {
  window: string;
  level: string;
  action: string;
};

export type RouteAdaptationView = {
  corridor: string;
  change: string;
  reason: string;
};

export type ContextualMessageView = {
  audience: string;
  channel: string;
  message: string;
  timing: string;
};

export type TrafficView = {
  corridor: string;
  status: string;
  impact: string;
  recommendation: string;
};

export type ConsentView = {
  source: string;
  status: string;
  lastUpdated: string;
};

export type InsightView = {
  model: string;
  confidence: string;
  insight: string;
  action: string;
};

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