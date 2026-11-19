import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { clearAuthToken, hydrateAuthToken } from './src/api';
import { fetchCatalog } from './src/catalog';
import { detectLanguage, t, type Locale } from './src/i18n';
import { EventCatalogScreen } from './src/screens/EventCatalogScreen';
import { HubScreen } from './src/screens/HubScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { MatchListScreen } from './src/screens/MatchListScreen';
import { PassScreen } from './src/screens/PassScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { WayfindingScreen } from './src/screens/WayfindingScreen';
import type { EventCatalogCard, LiveData, MatchCard } from './src/types';

const LOCALE_KEY = 'sfmp_locale';

const fonts = {
  tab: 'Poppins-SemiBold',
};

type TabParamList = {
  Hub: undefined;
  Wayfinding: undefined;
  Journey: undefined;
  Pass: undefined;
  Profile: undefined;
};

type CatalogShellState = {
  catalog: LiveData | null;
  catalogLoading: boolean;
  catalogError: string | null;
  selectedMatch: MatchCard | null;
  onRetryCatalog: () => void;
  onChangeMatch: () => void;
  onChangeEvent: () => void;
};

const CatalogShellContext = createContext<CatalogShellState | null>(null);

const AppStack = createBottomTabNavigator<TabParamList>();

const bootstrapStyles = StyleSheet.create({
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f8fc',
    padding: 24,
  },
  loadingBrand: {
    color: '#172033',
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 20,
  },
  loadingCopy: {
    color: '#60708b',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
});

function useCatalogShell() {
  const value = useContext(CatalogShellContext);
  if (!value) {
    throw new Error('Catalog shell context is missing');
  }

  return value;
}

function HubRoute({ locale }: { locale: Locale }) {
  const { catalog, catalogLoading, catalogError, selectedMatch, onRetryCatalog, onChangeMatch, onChangeEvent } = useCatalogShell();
  return (
    <HubScreen
      locale={locale}
      data={catalog}
      selectedMatch={selectedMatch}
      loading={catalogLoading}
      error={catalogError}
      onRetryCatalog={onRetryCatalog}
      onChangeMatch={onChangeMatch}
      onChangeEvent={onChangeEvent}
    />
  );
}

function JourneyRoute({ locale }: { locale: Locale }) {
  const { catalog, catalogLoading, selectedMatch } = useCatalogShell();
  return <JourneyScreen locale={locale} data={catalog} loading={catalogLoading} selectedMatch={selectedMatch} />;
}

function WayfindingRoute({ locale }: { locale: Locale }) {
  const { selectedMatch } = useCatalogShell();
  return <WayfindingScreen locale={locale} venueName={selectedMatch?.venue} city={selectedMatch?.city} country={selectedMatch?.country} />;
}

function ProfileRoute({ locale }: { locale: Locale }) {
  const { catalog, catalogLoading } = useCatalogShell();
  return <ProfileScreen locale={locale} data={catalog} loading={catalogLoading} />;
}

function renderTabIcon(name: keyof TabParamList, color: string, size: number) {
  switch (name) {
    case 'Hub':
      return <Ionicons name="grid-outline" color={color} size={size} />;
    case 'Wayfinding':
      return <Feather name="map" color={color} size={size} />;
    case 'Journey':
      return <Feather name="navigation" color={color} size={size} />;
    case 'Pass':
      return <Ionicons name="ticket-outline" color={color} size={size} />;
    case 'Profile':
      return <Feather name="user" color={color} size={size} />;
    default:
      return null;
  }
}

function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<'auth' | 'catalog' | 'matches' | 'app'>('auth');
  const [locale, setLocale] = useState<Locale>(() => detectLanguage());
  const [catalog, setCatalog] = useState<LiveData | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const handleLocaleChange = useCallback(async (nextLocale: Locale) => {
    setLocale(nextLocale);
    await AsyncStorage.setItem(LOCALE_KEY, nextLocale);
  }, []);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const nextCatalog = await fetchCatalog();
      setCatalog(nextCatalog);
      return nextCatalog;
    } catch {
      setCatalog(null);
      setCatalogError('Live backend catalog unavailable.');
      return null;
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      const savedLocale = await AsyncStorage.getItem(LOCALE_KEY);
      if (savedLocale && ['en', 'es', 'fr', 'de', 'pt', 'ar', 'zh', 'ru'].includes(savedLocale)) {
        setLocale(savedLocale as Locale);
      }

      const token = await hydrateAuthToken();
      if (!token) {
        if (active) {
          setReady(true);
          setSession('auth');
        }
        return;
      }

      if (active) {
        setSession('catalog');
        setReady(true);
      }

      try {
        await loadCatalog();
      } catch {
        // Keep the stored token and stay signed in until the user logs out manually.
      }
    })();

    return () => {
      active = false;
    };
  }, [loadCatalog]);

  const selectedCatalog = useMemo<EventCatalogCard | null>(() => {
    if (!catalog || !selectedCatalogId) return null;
    return catalog.eventCatalogs.find((item) => item.id === selectedCatalogId) ?? null;
  }, [catalog, selectedCatalogId]);

  const selectedMatch = useMemo<MatchCard | null>(() => {
    if (!catalog || !selectedMatchId) return null;
    return catalog.matches.find((item) => item.id === selectedMatchId) ?? null;
  }, [catalog, selectedMatchId]);

  const handleAuthenticated = useCallback(async () => {
    await loadCatalog();
    setSession('catalog');
  }, [loadCatalog]);

  const handleSelectCatalog = useCallback((catalogItem: EventCatalogCard) => {
    setSelectedCatalogId(catalogItem.id);
    setSelectedMatchId(null);
    setSession('matches');
  }, []);

  const handleSelectMatch = useCallback((match: MatchCard) => {
    setSelectedMatchId(match.id);
    setSession('app');
  }, []);

  const handleBackToCatalog = useCallback(() => {
    setSession('catalog');
  }, []);

  const handleBackToMatches = useCallback(() => {
    setSession('matches');
  }, []);

  const handleSignOut = useCallback(async () => {
    await clearAuthToken();
    setCatalog(null);
    setCatalogError(null);
    setSelectedCatalogId(null);
    setSelectedMatchId(null);
    setSession('auth');
  }, []);

  const shellValue = useMemo(
    () => ({
      catalog,
      catalogLoading,
      catalogError,
      selectedMatch,
      onRetryCatalog: loadCatalog,
      onChangeMatch: handleBackToMatches,
      onChangeEvent: handleBackToCatalog,
    }),
    [catalog, catalogError, catalogLoading, handleBackToCatalog, handleBackToMatches, loadCatalog, selectedMatch],
  );

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={bootstrapStyles.loadingShell}>
          <Text style={bootstrapStyles.loadingBrand}>SMART FAN MOBILITY</Text>
          <Text style={bootstrapStyles.loadingCopy}>Loading secure session…</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {Platform.OS === 'android'
        ? React.createElement(StatusBar as any, { barStyle: 'dark-content', backgroundColor: '#f6f8fc' })
        : React.createElement(StatusBar as any, { barStyle: 'dark-content' })}
      {session === 'auth' ? (
        <AuthScreen locale={locale} onLocaleChange={handleLocaleChange} onAuthenticated={handleAuthenticated} />
      ) : session === 'catalog' ? (
        <EventCatalogScreen locale={locale} catalogs={catalog?.eventCatalogs ?? []} onSelectCatalog={handleSelectCatalog} onSignOut={handleSignOut} />
      ) : session === 'matches' ? (
        <MatchListScreen
          locale={locale}
          catalog={selectedCatalog}
          matches={catalog?.matches.filter((item) => item.catalogId === selectedCatalogId) ?? []}
          onSelectMatch={handleSelectMatch}
          onBack={handleBackToCatalog}
          onBackToCatalog={handleBackToCatalog}
        />
      ) : (
        <CatalogShellContext.Provider value={shellValue}>
          <NavigationContainer>
            <AppStack.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#2457e6',
                tabBarInactiveTintColor: '#7183a1',
                tabBarLabelStyle: { fontFamily: fonts.tab, fontSize: 11, marginBottom: 2 },
                tabBarStyle: {
                  borderTopWidth: 1,
                  borderTopColor: '#dbe4ff',
                  backgroundColor: '#ffffff',
                  height: 64,
                  paddingTop: 8,
                  paddingBottom: 8,
                },
                tabBarLabel: getTabLabel(locale, route.name as keyof TabParamList),
                tabBarIcon: ({ color, size }) => renderTabIcon(route.name as keyof TabParamList, color, size),
              })}
            >
              <AppStack.Screen name="Hub">{() => <HubRoute locale={locale} />}</AppStack.Screen>
              <AppStack.Screen name="Wayfinding">{() => <WayfindingRoute locale={locale} />}</AppStack.Screen>
              <AppStack.Screen name="Journey">{() => <JourneyRoute locale={locale} />}</AppStack.Screen>
              <AppStack.Screen name="Pass">{() => <PassScreen locale={locale} />}</AppStack.Screen>
              <AppStack.Screen name="Profile">{() => <ProfileRoute locale={locale} />}</AppStack.Screen>
            </AppStack.Navigator>
          </NavigationContainer>
        </CatalogShellContext.Provider>
      )}
    </SafeAreaProvider>
  );
}

function getTabLabel(locale: Locale, name: keyof TabParamList): string {
  switch (name) {
    case 'Hub':
      return t(locale, 'nav.hub');
    case 'Wayfinding':
      return t(locale, 'nav.wayfinding');
    case 'Journey':
      return t(locale, 'nav.journey');
    case 'Pass':
      return t(locale, 'nav.pass');
    case 'Profile':
      return t(locale, 'nav.profile');
    default:
      return name;
  }
}

export default App;
