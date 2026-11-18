import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, type NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getJson } from './src/api';
import {
  auditLog as auditFallback,
  bookingCards as bookingFallback,
  contextualMessages as contextualFallback,
  consents as consentsFallback,
  demandPeaks as demandPeaksFallback,
  eventCards as eventFallback,
  heatmaps as heatmapsFallback,
  insights as insightsFallback,
  mobilityCards as mobilityFallback,
  operationMetrics as operationsFallback,
  organizations as organizationsFallback,
  roadmap as roadmapFallback,
  routeAdaptations as routeAdaptationsFallback,
  traffic as trafficFallback,
  users as usersFallback,
  type AuditCard,
  type BookingCard,
  type ConsentView,
  type ContextualMessageView,
  type DemandPeakView,
  type EventCard,
  type HeatmapView,
  type InsightView,
  type MobilityCard,
  type MetricCard,
  type OrgCard,
  type RoadmapView,
  type RouteAdaptationView,
  type TrafficView,
  type UserCard,
} from './src/demo';
import type { LiveData } from './src/types';
import { AuthScreen } from './src/screens/AuthScreen';
import { HubScreen } from './src/screens/HubScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { PassScreen } from './src/screens/PassScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WayfindingScreen } from './src/screens/WayfindingScreen';

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

const initialData: LiveData = {
  events: eventFallback,
  mobility: mobilityFallback,
  bookings: bookingFallback,
  operations: operationsFallback,
  organizations: organizationsFallback,
  users: usersFallback,
  audit: auditFallback,
  roadmap: roadmapFallback,
  heatmaps: heatmapsFallback,
  demandPeaks: demandPeaksFallback,
  routeAdaptations: routeAdaptationsFallback,
  contextualMessages: contextualFallback,
  traffic: trafficFallback,
  consents: consentsFallback,
  insights: insightsFallback,
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type AppData = {
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

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [signedIn, setSignedIn] = useState(false);
  const [data, setData] = useState<AppData>(initialData);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [events, mobility, bookings, operations, organizations, users, audit, roadmapRemote, heatmapsRemote, peaksRemote, routesRemote, contextualRemote, trafficRemote, consentsRemote, insightsRemote] = await Promise.all([
        getJson('/api/v1/events', eventFallback),
        getJson('/api/v1/mobility/options', mobilityFallback),
        getJson('/api/v1/bookings', bookingFallback),
        getJson('/api/v1/operations/summary', operationsFallback),
        getJson('/api/v1/admin/organizations', organizationsFallback),
        getJson('/api/v1/identity/users', usersFallback),
        getJson('/api/v1/audit/entries', auditFallback),
        getJson('/api/v1/platform/roadmap', roadmapFallback),
        getJson('/api/v1/crowd/heatmaps', heatmapsFallback),
        getJson('/api/v1/crowd/peaks', demandPeaksFallback),
        getJson('/api/v1/mobility/routes', routeAdaptationsFallback),
        getJson('/api/v1/notifications/contextual', contextualFallback),
        getJson('/api/v1/traffic/conditions', trafficFallback),
        getJson('/api/v1/gps/consents', consentsFallback),
        getJson('/api/v1/intelligence/insights', insightsFallback),
      ]);
      if (cancelled) return;
      setData({ events, mobility, bookings, operations, organizations, users, audit, roadmap: roadmapRemote, heatmaps: heatmapsRemote, demandPeaks: peaksRemote, routeAdaptations: routesRemote, contextualMessages: contextualRemote, traffic: trafficRemote, consents: consentsRemote, insights: insightsRemote });
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!signedIn ? (
            <RootStack.Screen name="Auth">{() => <AuthScreen onContinue={() => setSignedIn(true)} />}</RootStack.Screen>
          ) : (
            <RootStack.Screen name="App">{() => <MainTabs data={data} />}</RootStack.Screen>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function MainTabs({ data }: { data: AppData }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' }, tabBarActiveTintColor: '#2457e6' }}>
      <Tab.Screen name="Hub">{() => <HubScreen data={data} />}</Tab.Screen>
      <Tab.Screen name="Wayfinding">{() => <WayfindingScreen />}</Tab.Screen>
      <Tab.Screen name="Journey">{() => <JourneyScreen data={data} />}</Tab.Screen>
      <Tab.Screen name="Pass">{() => <PassScreen />}</Tab.Screen>
      <Tab.Screen name="Profile">{() => <ProfileScreen data={data} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

export default App;
