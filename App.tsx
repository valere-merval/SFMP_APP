import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { NavigationContainer, type NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getJson } from './src/api';
import {
  auditLog as auditFallback,
  bookingCards as bookingFallback,
  eventCards as eventFallback,
  fanHighlights,
  mobilityCards as mobilityFallback,
  operationMetrics as operationsFallback,
  organizations as organizationsFallback,
  users as usersFallback,
  type AuditCard,
  type BookingCard,
  type EventCard,
  type MobilityCard,
  type MetricCard,
  type OrgCard,
  type UserCard,
} from './src/demo';

type RootStackParamList = {
  Auth: undefined;
  App: NavigatorScreenParams<TabParamList>;
};

type TabParamList = {
  Hub: undefined;
  Wayfinding: undefined;
  Journey: undefined;
  Pass: undefined;
  Profile: undefined;
};

type LiveData = {
  events: EventCard[];
  mobility: MobilityCard[];
  bookings: BookingCard[];
  operations: MetricCard[];
  organizations: OrgCard[];
  users: UserCard[];
  audit: AuditCard[];
};

const initialData: LiveData = {
  events: eventFallback,
  mobility: mobilityFallback,
  bookings: bookingFallback,
  operations: operationsFallback,
  organizations: organizationsFallback,
  users: usersFallback,
  audit: auditFallback,
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [signedIn, setSignedIn] = useState(false);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [events, mobility, bookings, operations, organizations, users, audit] = await Promise.all([
        getJson('/api/v1/events', eventFallback),
        getJson('/api/v1/mobility/options', mobilityFallback),
        getJson('/api/v1/bookings', bookingFallback),
        getJson('/api/v1/operations/summary', operationsFallback),
        getJson('/api/v1/admin/organizations', organizationsFallback),
        getJson('/api/v1/identity/users', usersFallback),
        getJson('/api/v1/audit/entries', auditFallback),
      ]);
      if (cancelled) return;
      setData({ events, mobility, bookings, operations, organizations, users, audit });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!signedIn ? (
            <RootStack.Screen name="Auth">
              {() => <AuthScreen onContinue={() => setSignedIn(true)} />}
            </RootStack.Screen>
          ) : (
            <RootStack.Screen name="App">
              {() => <MainTabs data={data} />}
            </RootStack.Screen>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function AuthScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SMART FAN MOBILITY</Text>
          <Text style={styles.title}>Sign in to matchday mobility</Text>
          <Text style={styles.subtitle}>
            Use your fan account, operator account or admin account to access the right journey.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardKicker}>Secure access</Text>
          <Text style={styles.cardTitle}>Continue into the platform</Text>
          <Text style={styles.muted}>A real auth provider can plug into this screen later.</Text>
          <View style={styles.ctaRow}>
            <PrimaryButton label="Continue" onPress={onContinue} />
            <SecondaryButton label="Use guest mode" onPress={onContinue} />
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardKicker}>What you get</Text>
          {['Journey planning', 'Wayfinding maps', 'Ticket and transit pass', 'Operations visibility'].map((item) => (
            <Bullet key={item}>{item}</Bullet>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MainTabs({ data }: { data: LiveData }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarLabelStyle: styles.tabLabel, tabBarActiveTintColor: '#2457e6' }}>
      <Tab.Screen name="Hub">{() => <HubScreen data={data} />}</Tab.Screen>
      <Tab.Screen name="Wayfinding">{() => <WayfindingScreen />}</Tab.Screen>
      <Tab.Screen name="Journey">{() => <JourneyScreen data={data} />}</Tab.Screen>
      <Tab.Screen name="Pass">{() => <PassScreen />}</Tab.Screen>
      <Tab.Screen name="Profile">{() => <ProfileScreen data={data} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

function HubScreen({ data }: { data: LiveData }) {
  const hero = useMemo(() => data.events[0], [data.events]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SMART FAN MOBILITY</Text>
          <Text style={styles.title}>Smart fan mobility for matchday travel</Text>
          <Text style={styles.subtitle}>
            One product surface for fans, mobility operations and platform administration.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Pill>{hero.status}</Pill>
            <Pill subtle>LIVE</Pill>
          </View>
          <Text style={styles.cardKicker}>Next sporting event</Text>
          <Text style={styles.cardTitle}>{hero.title}</Text>
          <Text style={styles.muted}>{hero.venue} · {hero.city}</Text>
          <View style={styles.statsRow}>
            <Stat label="Date" value={hero.date} />
            <Stat label="Fans" value={hero.attendance} />
            <Stat label="Gate" value="34 East Hub" />
          </View>
          <View style={styles.ctaRow}>
            <PrimaryButton label="Plan my journey" onPress={() => undefined} />
            <SecondaryButton label="View event details" onPress={() => undefined} />
          </View>
        </View>

        <Card title="Transit direct lines" subtitle="Matchday routing" wide>
          <View style={styles.grid2}>
            {data.mobility.map((item) => (
              <MiniCard key={item.id} title={item.mode} subtitle={item.badge} meta={`${item.duration} · ${item.price}`} />
            ))}
          </View>
        </Card>

        <Card title="Perimeter live telemetry" subtitle="Operations feed">
          {data.operations.map((item) => (
            <Row key={item.id} leftTitle={item.label} leftSubtitle={item.trend} rightTitle={item.value} rightSubtitle="Live" />
          ))}
        </Card>

        <Card title="Stadium perimeter gates" subtitle="Wayfinding" wide>
          <View style={styles.mapPanel}>
            <View style={styles.mapOverlay}>
              <Text style={styles.cardTitle}>Gate 34 · East Hub</Text>
              <Text style={styles.muted}>Walk 3 min from the fan zone. Queue time: 8 min.</Text>
            </View>
            <View style={styles.mapDot1} />
            <View style={styles.mapDot2} />
            <View style={styles.mapDot3} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function WayfindingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>WAYFINDING</Text>
          <Text style={styles.title}>Interactive mobility map</Text>
          <Text style={styles.subtitle}>Blue route = fastest. Lime markers = live gates and transfer points.</Text>
        </View>
        <Card title="Route map" subtitle="Live routing" wide>
          <View style={styles.darkMap}>
            <View style={styles.mapOverlayCard}>
              <Text style={styles.cardTitleDark}>Madrid live network</Text>
              <Text style={styles.mutedLight}>Blue route = fastest. Lime markers = live gates and transfer points.</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeNodeStart} />
            <View style={styles.routeNodeMid} />
            <View style={styles.routeNodeEnd} />
          </View>
        </Card>
        <Card title="Route filters" subtitle="Search">
          <View style={styles.chipsRow}>
            <Pill subtle>All routes</Pill>
            <Pill subtle>Fastest</Pill>
            <Pill subtle>Free with pass</Pill>
            <Pill subtle>Step-free</Pill>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function JourneyScreen({ data }: { data: LiveData }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>JOURNEY</Text>
          <Text style={styles.title}>Plan, book and depart</Text>
          <Text style={styles.subtitle}>Reservation flow, step-by-step trip guidance and booking history.</Text>
        </View>
        <Card title="Journey planner" subtitle="Trip setup" wide>
          {fanHighlights.map((item) => <Bullet key={item}>{item}</Bullet>)}
        </Card>
        <Card title="Booking checkout" subtitle="Reservation flow">
          {data.bookings.map((item) => (
            <Row key={item.id} leftTitle={item.fanName} leftSubtitle={`${item.option} · ${item.status}`} rightTitle={item.time} rightSubtitle="Departure" />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function PassScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>PASS</Text>
          <Text style={styles.title}>Digital transit pass</Text>
          <Text style={styles.subtitle}>Free transit with pass and offline backup availability.</Text>
        </View>
        <Card title="Matchday access" subtitle="Confirmation" wide>
          <View style={styles.passCard}>
            <Text style={styles.passKicker}>UCL MATCHDAY PASS</Text>
            <Text style={styles.passTitle}>Free transit with pass</Text>
            <Text style={styles.passMeta}>Metro, shuttle and priority corridor access enabled.</Text>
            <View style={styles.qrMock} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileScreen({ data }: { data: LiveData }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>PROFILE</Text>
          <Text style={styles.title}>Fan and admin identity</Text>
          <Text style={styles.subtitle}>Account preferences, travel history and admin visibility.</Text>
        </View>
        <Card title="Fan profile" subtitle="Account" wide>
          <Row leftTitle="Amina Diallo" leftSubtitle="Fan profile" rightTitle="Madrid" rightSubtitle="City" />
          <Row leftTitle="Preferences" leftSubtitle="Step-free routes · Notifications on" rightTitle="Active" rightSubtitle="Settings" />
        </Card>
        <Card title="Travel history" subtitle="Recent trips">
          {data.events.map((item) => (
            <Row key={item.id} leftTitle={item.title} leftSubtitle={`${item.venue} · ${item.city}`} rightTitle={item.date} rightSubtitle={item.status} />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ title, subtitle, children, wide = false }: { title: string; subtitle: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <View style={[styles.card, wide && styles.cardWide]}>
      <Text style={styles.cardKicker}>{subtitle}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function MiniCard({ title, subtitle, meta }: { title: string; subtitle: string; meta: string }) {
  return (
    <View style={styles.miniCard}>
      <Text style={styles.miniCardTitle}>{title}</Text>
      <Text style={styles.muted}>{subtitle}</Text>
      <Text style={styles.miniCardMeta}>{meta}</Text>
    </View>
  );
}

function Row({ leftTitle, leftSubtitle, rightTitle, rightSubtitle }: { leftTitle: string; leftSubtitle: string; rightTitle: string; rightSubtitle: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>{leftTitle}</Text>
        <Text style={styles.muted}>{leftSubtitle}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowTitle}>{rightTitle}</Text>
        <Text style={styles.muted}>{rightSubtitle}</Text>
      </View>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.dot} />
      <Text style={styles.muted}>{children}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function Pill({ children, subtle = false }: { children: React.ReactNode; subtle?: boolean }) {
  return <Text style={[styles.pill, subtle && styles.pillSubtle]}>{children}</Text>;
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f8fc' },
  container: { padding: 18, gap: 14, backgroundColor: '#f6f8fc' },
  header: { padding: 20, borderRadius: 24, backgroundColor: '#101b2d', gap: 10 },
  kicker: { color: '#94a3b8', letterSpacing: 1.2, fontSize: 12, fontWeight: '700' },
  title: { color: '#ffffff', fontSize: 31, lineHeight: 36, fontWeight: '800' },
  subtitle: { color: '#cbd5e1', fontSize: 15, lineHeight: 22 },
  heroCard: { padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', gap: 12 },
  heroRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  card: { padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', gap: 10 },
  cardWide: { width: '100%' },
  cardBody: { gap: 12 },
  cardKicker: { color: '#66758f', textTransform: 'uppercase', letterSpacing: 1, fontSize: 11, fontWeight: '700' },
  cardTitle: { color: '#172033', fontSize: 20, fontWeight: '800' },
  cardTitleDark: { color: '#fff', fontSize: 20, fontWeight: '800' },
  muted: { color: '#60708b' },
  mutedLight: { color: '#aeb8cb' },
  pill: { backgroundColor: '#101b2d', color: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontSize: 12, fontWeight: '700' },
  pillSubtle: { backgroundColor: '#edf2ff', color: '#1d3fb3' },
  statsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statBox: { flexGrow: 1, flexBasis: '30%', padding: 12, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e6eaf0' },
  statLabel: { color: '#60708b', fontSize: 12 },
  statValue: { color: '#101b2d', fontSize: 16, fontWeight: '800', marginTop: 4 },
  ctaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  primaryButton: { backgroundColor: '#2457e6', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#eef2ff', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14 },
  secondaryButtonText: { color: '#1d3fb3', fontWeight: '700' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  miniCard: { flexBasis: '48%', flexGrow: 1, padding: 14, borderRadius: 18, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e6eaf0', gap: 4 },
  miniCardTitle: { color: '#101b2d', fontSize: 15, fontWeight: '800' },
  miniCardMeta: { color: '#101b2d', fontWeight: '700', marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowLeft: { flex: 1 },
  rowTitle: { color: '#101b2d', fontSize: 15, fontWeight: '700' },
  rowRight: { alignItems: 'flex-end' },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#2457e6' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  passCard: { padding: 18, borderRadius: 20, backgroundColor: '#101b2d', gap: 10 },
  passKicker: { color: '#94a3b8', fontSize: 12, letterSpacing: 1.2, fontWeight: '700' },
  passTitle: { color: '#ffffff', fontSize: 24, lineHeight: 30, fontWeight: '800' },
  passMeta: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
  qrMock: { height: 160, borderRadius: 16, backgroundColor: '#e5edff' },
  mapPanel: { minHeight: 240, borderRadius: 18, backgroundColor: '#edf2ff', borderWidth: 1, borderColor: '#dbe4ff', overflow: 'hidden', justifyContent: 'flex-end' },
  darkMap: { minHeight: 280, borderRadius: 18, backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1b273a', overflow: 'hidden', justifyContent: 'flex-end' },
  mapOverlay: { padding: 16, backgroundColor: 'rgba(255,255,255,0.84)' },
  mapOverlayCard: { margin: 16, padding: 16, borderRadius: 16, backgroundColor: 'rgba(11,18,32,0.78)', borderWidth: 1, borderColor: '#1b273a' },
  routeLine: { position: 'absolute', left: '18%', top: '55%', width: '64%', height: 6, borderRadius: 999, backgroundColor: '#2457e6' },
  routeNodeStart: { position: 'absolute', left: '16%', top: '50%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#c8f36a' },
  routeNodeMid: { position: 'absolute', left: '50%', top: '47%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#2457e6' },
  routeNodeEnd: { position: 'absolute', left: '82%', top: '50%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#c8f36a' },
  mapDot1: { position: 'absolute', top: '18%', left: '20%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#2457e6' },
  mapDot2: { position: 'absolute', top: '36%', left: '55%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#c8f36a' },
  mapDot3: { position: 'absolute', top: '68%', left: '74%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#2457e6' },
  tabLabel: { fontSize: 11, fontWeight: '700' },
});

export default App;
