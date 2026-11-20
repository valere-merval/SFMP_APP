export type EventCard = {
  id: string;
  title: string;
  city: string;
  venue: string;
  date: string;
  status: string;
  attendance: string;
};

export type EventCatalogCard = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sport: string;
  country: string;
  badge: string;
  eventCount: number;
};

export type MatchCard = {
  id: string;
  catalogId: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  city: string;
  country: string;
  venue: string;
  stage: string;
  date: string;
  time: string;
  status: string;
  gate: string;
  sector: string;
  countdown: string;
  weather: string;
  temperature: string;
  transitSummary: string;
  ticketAvailable: boolean;
  ticketPrice: string;
  ticketsTotal: number | null;
  ticketsRemaining: number | null;
  imageUrl: string;
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

export type TransportProviderCard = {
  id: string;
  matchId: string;
  matchTitle: string;
  providerType: string;
  displayName: string;
  driverName: string;
  vehicleLabel: string;
  vehiclePlate: string;
  city: string;
  country: string;
  zone: string;
  status: string;
  active: boolean;
  permitUrl?: string;
  registrationUrl?: string;
  driverLicenseUrl?: string;
  vehicleImageUrl?: string;
  notes?: string;
  publicNotes?: string;
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

export type TransportProviderView = {
  id: string;
  matchId: string;
  matchTitle: string;
  providerType: string;
  displayName: string;
  vehicleLabel: string;
  zone: string;
  status: string;
  active: boolean;
  city: string;
  country: string;
};

export type LiveData = {
  events: EventCard[];
  eventCatalogs: EventCatalogCard[];
  matches: MatchCard[];
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
  transportProviders: TransportProviderView[];
};
