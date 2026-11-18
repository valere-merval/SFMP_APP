export type EventCard = {
  id: string
  title: string
  city: string
  venue: string
  date: string
  status: string
  attendance: string
}

export type MobilityCard = {
  id: string
  mode: string
  duration: string
  price: string
  badge: string
}

export type BookingCard = {
  id: string
  fanName: string
  option: string
  time: string
  status: string
}

export type MetricCard = {
  id: string
  label: string
  value: string
  trend: string
}

export type OrgCard = {
  id: string
  name: string
  type: string
  status: string
}

export type UserCard = {
  id: string
  name: string
  role: string
  org: string
  status: string
}

export type AuditCard = {
  id: string
  action: string
  actor: string
  resource: string
}

export type IntegrationView = {
  id: string
  name: string
  status: string
  endpoint: string
}

export type RoadmapView = {
  version: string
  title: string
  features: string[]
}

export type HeatmapView = {
  zone: string
  intensity: string
  trend: string
  recommendation: string
}

export type DemandPeakView = {
  window: string
  level: string
  action: string
}

export type RouteAdaptationView = {
  corridor: string
  change: string
  reason: string
}

export type ContextualMessageView = {
  audience: string
  channel: string
  message: string
  timing: string
}

export type TrafficView = {
  corridor: string
  status: string
  impact: string
  recommendation: string
}

export type ConsentView = {
  source: string
  status: string
  lastUpdated: string
}

export type InsightView = {
  model: string
  confidence: string
  insight: string
  action: string
}

export const featuredEvent: EventCard = {
  id: 'evt_madrid_final',
  title: 'UEFA Champions League Final',
  city: 'Madrid',
  venue: 'Estadio Metropolitano',
  date: '29 May 2027',
  status: 'Sales open',
  attendance: '68,200 fans',
}

export const eventCards: EventCard[] = [
  featuredEvent,
  { id: 'evt_training', title: 'Fan Mobility Dry Run', city: 'Madrid', venue: 'Estadio Metropolitano', date: '27 May 2027', status: 'Planning', attendance: '1,200 fans' },
  { id: 'evt_city', title: 'Fan City Experience', city: 'Madrid', venue: 'Plaza de Oriente', date: '28 May 2027', status: 'Published', attendance: '5,400 fans' },
]

export const mobilityCards: MobilityCard[] = [
  { id: 'mob_metro', mode: 'Metro', duration: '18 min', price: '€2.10', badge: 'Recommended' },
  { id: 'mob_shuttle', mode: 'Official Shuttle', duration: '25 min', price: '€8.00', badge: 'Live' },
  { id: 'mob_taxi', mode: 'Taxi / Ride-hailing', duration: '22 min', price: '€24-35', badge: 'Available' },
  { id: 'mob_walk', mode: 'Walking', duration: '34 min', price: 'Free', badge: 'Available' },
]

export const bookingCards: BookingCard[] = [
  { id: 'bkg_1', fanName: 'Amina Diallo', option: 'Official Shuttle', time: '18:10', status: 'Confirmed' },
  { id: 'bkg_2', fanName: 'Jonas Weber', option: 'Metro + Walk', time: '18:25', status: 'Pending' },
  { id: 'bkg_3', fanName: 'Sara Ahmed', option: 'Taxi', time: '17:40', status: 'Cancelled' },
]

export const operationMetrics: MetricCard[] = [
  { id: 'ops_1', label: 'Live vehicles', value: '124', trend: '+6' },
  { id: 'ops_2', label: 'Bookings processed', value: '3,842', trend: '+11%' },
  { id: 'ops_3', label: 'Open incidents', value: '2', trend: '-1' },
  { id: 'ops_4', label: 'Average ETA', value: '19 min', trend: '-3 min' },
]

export const operationForecasts: MetricCard[] = [
  { id: 'pred_1', label: 'Metro load at 18:30', value: '91%', trend: 'High' },
  { id: 'pred_2', label: 'Airport shuttle demand', value: '1,820 riders', trend: 'Medium' },
  { id: 'pred_3', label: 'Post-match burst', value: '18 min spike', trend: 'High' },
]

export const organizations: OrgCard[] = [
  { id: 'org_uefa', name: 'UEFA', type: 'Competition owner', status: 'Active' },
  { id: 'org_atleti', name: 'Atlético de Madrid', type: 'Club', status: 'Active' },
  { id: 'org_metro', name: 'Metro de Madrid', type: 'Transport operator', status: 'Pilot' },
]

export const users: UserCard[] = [
  { id: 'usr_1', name: 'Valeria Gomez', role: 'Platform Admin', org: 'SFMP', status: 'Active' },
  { id: 'usr_2', name: 'Hassan Karim', role: 'Operations Lead', org: 'Metro de Madrid', status: 'Active' },
  { id: 'usr_3', name: 'Alicia Perez', role: 'Fan', org: 'UEFA', status: 'Invited' },
]

export const auditLog: AuditCard[] = [
  { id: 'aud_1', action: 'UPDATED_BOOKING', actor: 'ops-admin', resource: 'booking:bkg_1' },
  { id: 'aud_2', action: 'CREATED_EVENT', actor: 'platform-admin', resource: 'event:evt_madrid_final' },
  { id: 'aud_3', action: 'PUBLISHED_NOTIFICATION', actor: 'system', resource: 'notification:ntf_2' },
]

export const roadmap: RoadmapView[] = [
  { version: 'Version 1', title: 'MVP', features: ['Gestion des événements', 'Découverte des événements', 'Planification des déplacements', 'Carte interactive', 'Réservation de transport démonstrative', 'Dashboard opérationnel', 'Collecte d\'analytics', 'Première démonstration prédictive'] },
  { version: 'Version 2', title: 'Pilot Platform', features: ['Intégration des partenaires de transport', 'Gestion des chauffeurs et véhicules', 'Tracking GPS avec consentement', 'Notifications intelligentes', 'Intégration des données de trafic', 'Prévisions de demande', 'Gestion avancée des zones'] },
  { version: 'Version 3', title: 'Intelligent Mobility', features: ['Machine Learning pour les prévisions', 'Heatmaps de mobilité', 'Détection des pics de demande', 'Optimisation des points de ramassage', 'Adaptation des itinéraires', 'Communications contextuelles', 'Analytics avancées'] },
]

export const heatmaps: HeatmapView[] = [
  { zone: 'Gate 12', intensity: 'Critical', trend: 'Rising', recommendation: 'Open additional corridor' },
  { zone: 'Gate 14', intensity: 'High', trend: 'Stable', recommendation: 'Keep extra staff deployed' },
  { zone: 'Metro Plaza', intensity: 'Medium', trend: 'Falling', recommendation: 'Maintain current routing' },
]

export const demandPeaks: DemandPeakView[] = [
  { window: '18:00-18:45', level: 'High', action: 'Pre-position shuttles' },
  { window: '20:55-21:40', level: 'Critical', action: 'Activate overflow lanes' },
  { window: '22:15-22:45', level: 'Medium', action: 'Open return-trip wave' },
]

export const routeAdaptations: RouteAdaptationView[] = [
  { corridor: 'Airport Corridor', change: 'Reroute via Ring Road', reason: 'Traffic slowdown detected' },
  { corridor: 'North Zone', change: 'Shorten shuttle loop', reason: 'Demand concentrated at gates' },
  { corridor: 'Fan Village', change: 'Add walking guidance', reason: 'Pedestrian flow is under capacity' },
]

export const contextualMessages: ContextualMessageView[] = [
  { audience: 'Fans near Gate 12', channel: 'Push', message: 'Use Gate 14 for faster entry.', timing: 'Now' },
  { audience: 'Late arrivals', channel: 'SMS', message: 'Your shuttle departs in 12 minutes.', timing: 'T-12m' },
  { audience: 'Drivers', channel: 'In-app', message: 'Switch to adaptive route A due to traffic.', timing: 'Live' },
]

export const traffic: TrafficView[] = [
  { corridor: 'Airport Corridor', status: 'Heavy', impact: '+18 min', recommendation: 'Reroute via Ring Road' },
  { corridor: 'North Ring', status: 'Moderate', impact: '+7 min', recommendation: 'Keep shuttle loop short' },
  { corridor: 'Stadium Access', status: 'Clear', impact: '0 min', recommendation: 'Proceed as planned' },
]

export const consents: ConsentView[] = [
  { source: 'Fan app', status: 'Granted', lastUpdated: '2027-05-29 16:50' },
  { source: 'Driver app', status: 'Granted', lastUpdated: '2027-05-29 16:20' },
  { source: 'Visitor web', status: 'Pending', lastUpdated: '2027-05-29 16:05' },
]

export const insights: InsightView[] = [
  { model: 'PeakNet v2', confidence: '93%', insight: 'Demand will spike near Gate 14 at 20:55', action: 'Pre-position shuttles' },
  { model: 'RouteBrain v1', confidence: '89%', insight: 'Airport corridor traffic will slow in 15 minutes', action: 'Switch to adaptive route A' },
  { model: 'CrowdFlow v3', confidence: '91%', insight: 'Walking inflow will exceed average by 12%', action: 'Open extra pedestrian lane' },
]

export const fanHighlights = [
  'Real-time journey planning',
  'Booking orchestration',
  'Stadium-focused mobility guidance',
]
