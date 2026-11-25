import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { clearAuthToken, getSessionUser, hydrateAuthToken, loadUserProfile, type UserProfileView } from './src/api';
import { fetchCatalog } from './src/catalog';
import { detectLanguage, t, type Locale } from './src/i18n';
import { EventCatalogScreen } from './src/screens/EventCatalogScreen';
import { HubScreen } from './src/screens/HubScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { MatchListScreen } from './src/screens/MatchListScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { WayfindingScreen } from './src/screens/WayfindingScreen';
import { MicroMobilityScreen } from './src/screens/MicroMobilityScreen';
import type { EventCatalogCard, LiveData, MatchCard } from './src/types';
import { AvatarPhoto, BrandLogo } from './src/ui';

const LOCALE_KEY = 'sfmp_locale';

const fonts = {
  tab: 'Poppins-SemiBold',
};

type TabParamList = {
  Hub: undefined;
  Wayfinding: undefined;
  Journey: undefined;
  Mobility: undefined;
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

type AppUserProfile = UserProfileView | null;

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
  loadingCopy: {
    color: '#60708b',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
});

const shellStyles = StyleSheet.create({
  connectedShell: {
    flex: 1,
    backgroundColor: '#f6f8fc',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#D946EF',
    backgroundColor: '#D946EF',
  },
  topBarSafeArea: { backgroundColor: '#D946EF' },
  statusBar: { backgroundColor: '#D946EF' },
  brandBlock: {
    flex: 1,
  },
  logoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f8fc',
    borderWidth: 1,
    borderColor: '#dbe4ff',
    overflow: 'hidden',
  },
  avatarButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
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

function MobilityRoute({ locale }: { locale: Locale }) {
  const { catalog, selectedMatch } = useCatalogShell();
  return <MicroMobilityScreen locale={locale} data={catalog} venueName={selectedMatch?.venue} city={selectedMatch?.city} country={selectedMatch?.country} />;
}

function WayfindingRoute({ locale }: { locale: Locale }) {
  const {catalog,  selectedMatch } = useCatalogShell();
  return <WayfindingScreen locale={locale} venueName={selectedMatch?.venue} city={selectedMatch?.city} country={selectedMatch?.country} data={catalog} />;
}

function ProfileRoute({ locale, onProfileUpdated, onLocaleChange }: { locale: Locale; onProfileUpdated?: () => void; onLocaleChange?: (locale: Locale) => void }) {
  const { catalog, catalogLoading } = useCatalogShell();
  return <ProfileScreen locale={locale} data={catalog} loading={catalogLoading} onProfileUpdated={onProfileUpdated} onLocaleChange={onLocaleChange} />;
}

function renderTabIcon(name: keyof TabParamList, color: string, size: number) {
  switch (name) {
    case 'Hub':
      return <Ionicons name="grid-outline" color={color} size={size} />;
    case 'Wayfinding':
      return <Ionicons name="bus-outline" color={color} size={size} />;
    case 'Journey':
      return <Feather name="map" color={color} size={size} />;
    case 'Mobility':
      return <Ionicons name="bicycle-outline" color={color} size={size} />;
    case 'Profile':
      return <Feather name="user" color={color} size={size} />;
    default:
      return null;
  }
}

function getAvatarFallbackName(profile: AppUserProfile) {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  if (name) return name;
  const sessionUser = getSessionUser();
  return sessionUser?.fullName ?? sessionUser?.email ?? 'SF';
}

function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<'auth' | 'catalog' | 'matches' | 'app'>('auth');
  const [activeTab, setActiveTab] = useState<keyof TabParamList>('Hub');
  const [locale, setLocale] = useState<Locale>(() => detectLanguage());
  const [catalog, setCatalog] = useState<LiveData | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<AppUserProfile>(null);
  const navigationRef = useRef<any>(null);

  const refreshUserProfile = useCallback(async () => {
    try {
      const profile = await loadUserProfile();
      setUserProfile(profile);
      return profile;
    } catch {
      const sessionUser = getSessionUser();
      setUserProfile(
        sessionUser
          ? { email: sessionUser.email ?? '', firstName: '', lastName: '', country: '', city: '', phonePrefix: '', phone: '', preferredLanguage: 'en', photoUrl: null }
          : null,
      );
      return null;
    }
  }, []);

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
      setCatalogError(t(locale, 'common.backendUnavailable'));
      return null;
    } finally {
      setCatalogLoading(false);
    }
  }, [locale]);

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
    await refreshUserProfile();
    setSession('catalog');
  }, [loadCatalog, refreshUserProfile]);

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

  const handleOpenProfile = useCallback(() => {
    setActiveTab('Profile');
    setSession('app');
    requestAnimationFrame(() => {
      navigationRef.current?.navigate?.('Profile');
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await clearAuthToken();
    setCatalog(null);
    setCatalogError(null);
    setSelectedCatalogId(null);
    setSelectedMatchId(null);
    setUserProfile(null);
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
        <SafeAreaView style={bootstrapStyles.loadingShell} edges={['top', 'left', 'right']}>
          <BrandLogo />
          <Text style={bootstrapStyles.loadingCopy}>{t(locale, 'common.loadingSession')}</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={['top', 'bottom']}
        style={{ backgroundColor: '#D946EF' }}
      >
        {/* Header content */}
      </SafeAreaView>
      <StatusBar
        showHideTransition={'slide'}
        barStyle={'dark-content'}
        animated={true}
      />
      {session === 'auth' ? (
        <AuthScreen
          locale={locale}
          onLocaleChange={handleLocaleChange}
          onAuthenticated={handleAuthenticated}
        />
      ) : (
        <View style={shellStyles.connectedShell}>
          <View style={shellStyles.topBar}>
            <View style={shellStyles.brandBlock}>
              <Pressable
                style={shellStyles.logoButton}
                accessibilityRole="imagebutton"
                accessibilityLabel="Smart Fan Mobility logo"
              >
                <BrandLogo compact />
              </Pressable>
            </View>
            <Pressable
              style={shellStyles.avatarButton}
              onPress={handleOpenProfile}
              accessibilityRole="button"
              accessibilityLabel="Open profile area"
            >
              <AvatarPhoto
                uri={userProfile?.photoUrl}
                label={getAvatarFallbackName(userProfile)}
              />
            </Pressable>
          </View>
          {session === 'catalog' ? (
            <EventCatalogScreen
              locale={locale}
              catalogs={catalog?.eventCatalogs ?? []}
              onSelectCatalog={handleSelectCatalog}
              onSignOut={handleSignOut}
            />
          ) : session === 'matches' ? (
            <MatchListScreen
              locale={locale}
              catalog={selectedCatalog}
              matches={
                catalog?.matches.filter(
                  item => item.catalogId === selectedCatalogId,
                ) ?? []
              }
              onSelectMatch={handleSelectMatch}
              onBack={handleBackToCatalog}
              onBackToCatalog={handleBackToCatalog}
            />
          ) : (
            <CatalogShellContext.Provider value={shellValue}>
            <NavigationContainer
              ref={navigationRef}
              onStateChange={() => {
                const current = navigationRef.current?.getCurrentRoute?.();
                if (current?.name && ['Hub', 'Wayfinding', 'Journey', 'Mobility', 'Profile'].includes(current.name)) {
                  setActiveTab(current.name as keyof TabParamList);
                }
              }}
            >
              <AppStack.Navigator
                initialRouteName={activeTab}
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: '#D946EF',
                    tabBarInactiveTintColor: '#7183a1',
                    tabBarLabelStyle: {
                      fontFamily: fonts.tab,
                      fontSize: 11,
                      marginBottom: 2,
                    },
                    tabBarStyle: {
                      borderTopWidth: 1,
                      borderTopColor: '#dbe4ff',
                      backgroundColor: '#ffffff',
                      height: 64,
                      paddingTop: 8,
                      paddingBottom: 8,
                    },
                    tabBarLabel: getTabLabel(
                      locale,
                      route.name as keyof TabParamList,
                    ),
                    tabBarIcon: ({ color, size }) =>
                      renderTabIcon(
                        route.name as keyof TabParamList,
                        color,
                        size,
                      ),
                  })}
                >
                  <AppStack.Screen name="Hub">
                    {() => <HubRoute locale={locale} />}
                  </AppStack.Screen>
                  <AppStack.Screen name="Wayfinding">
                    {() => <WayfindingRoute locale={locale} />}
                  </AppStack.Screen>
                  <AppStack.Screen name="Journey">
                    {() => <JourneyRoute locale={locale} />}
                  </AppStack.Screen>
                  <AppStack.Screen name="Mobility">
                    {() => <MobilityRoute locale={locale} />}
                  </AppStack.Screen>
                  <AppStack.Screen name="Profile">
                    {() => (
                      <ProfileRoute
                        locale={locale}
                        onProfileUpdated={refreshUserProfile}
                        onLocaleChange={(nextLocale) => {
                          setLocale(nextLocale);
                          setActiveTab('Profile');
                          requestAnimationFrame(() => {
                            navigationRef.current?.navigate?.('Profile');
                          });
                        }}
                      />
                    )}
                  </AppStack.Screen>
                </AppStack.Navigator>
              </NavigationContainer>
            </CatalogShellContext.Provider>
          )}
        </View>
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
    case 'Mobility':
      return t(locale, 'nav.mobility');
    case 'Profile':
      return t(locale, 'nav.profile');
    default:
      return name;
  }
}

export default App;
