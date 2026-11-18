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

export const fanHighlights = [
  'Real-time journey planning',
  'Booking orchestration',
  'Stadium-focused mobility guidance',
]
