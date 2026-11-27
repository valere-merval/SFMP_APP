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
import { requestCurrentCoordinates, type Coordinate } from './src/location';
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
const LOCATION_CONSENT_KEY = 'sfmp_location_consent';

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
    backgroundColor: '#0e1321',
    padding: 24,
  },
  loadingCopy: {
    color: '#b2bfd4',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
});

const shellStyles = StyleSheet.create({
  connectedShell: {
    flex: 1,
    backgroundColor: '#0e1321',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(14, 19, 33, 0.94)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.08)',
  },
  topBarSafeArea: { backgroundColor: '#0e1321' },
  statusBar: { backgroundColor: '#0e1321' },
  brandBlock: {
    flex: 1,
  },
  logoButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 26, 46, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.16)',
    overflow: 'hidden',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.16)',
  },
  locationGate: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: 'rgba(5, 9, 18, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  locationGateCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    padding: 22,
    backgroundColor: 'rgba(14, 19, 33, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
  },
  locationGateTitle: {
    color: '#f8fbff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  locationGateBody: {
    color: '#b2bfd4',
    fontFamily: 'Poppins-Regular',
    marginTop: 10,
    lineHeight: 20,
  },
  locationGateHint: {
    color: '#8da0bd',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    lineHeight: 18,
  },
  locationGateActions: {
    marginTop: 18,
    gap: 12,
  },
  locationGateError: {
    color: '#ff9db3',
    fontFamily: 'Poppins-Medium',
    marginTop: 10,
  },
});

function useCatalogShell() {
  const value = useContext(CatalogShellContext);
  if (!value) {
    throw new Error('Catalog shell context is missing');
  }

  return value;
}

function HubRoute({ locale, currentLocation }: { locale: Locale; currentLocation: Coordinate | null }) {
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
      currentLocation={currentLocation}
    />
  );
}

function JourneyRoute({ locale, currentLocation }: { locale: Locale; currentLocation: Coordinate | null }) {
  const { catalog, catalogLoading, selectedMatch } = useCatalogShell();
  return <JourneyScreen locale={locale} data={catalog} loading={catalogLoading} selectedMatch={selectedMatch} currentLocation={currentLocation} />;
}

function MobilityRoute({ locale }: { locale: Locale }) {
  const { catalog, selectedMatch } = useCatalogShell();
  return <MicroMobilityScreen locale={locale} data={catalog} venueName={selectedMatch?.venue} city={selectedMatch?.city} country={selectedMatch?.country} />;
}

function WayfindingRoute({ locale }: { locale: Locale }) {
  const {catalog,  selectedMatch } = useCatalogShell();
  return <WayfindingScreen locale={locale} venueName={selectedMatch?.venue} city={selectedMatch?.city} country={selectedMatch?.country} data={catalog} />;
}

function ProfileRoute({ locale, selectedMatch, onProfileUpdated, onLocaleChange }: { locale: Locale; selectedMatch?: MatchCard | null; onProfileUpdated?: () => void; onLocaleChange?: (locale: Locale) => void }) {
  const { catalog, catalogLoading } = useCatalogShell();
  return <ProfileScreen locale={locale} data={catalog} loading={catalogLoading} selectedMatch={selectedMatch} onProfileUpdated={onProfileUpdated} onLocaleChange={onLocaleChange} />;
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
  const [iconsReady, setIconsReady] = useState(false);
  const [session, setSession] = useState<'auth' | 'catalog' | 'matches' | 'app'>('auth');
  const [activeTab, setActiveTab] = useState<keyof TabParamList>('Hub');
  const [locale, setLocale] = useState<Locale>(() => detectLanguage());
  const [catalog, setCatalog] = useState<LiveData | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<AppUserProfile>(null);
  const [deviceLocation, setDeviceLocation] = useState<Coordinate | null>(null);
  const [locationConsent, setLocationConsent] = useState<boolean | null>(null);
  const [locationPromptError, setLocationPromptError] = useState<string | null>(null);
  const navigationRef = useRef<any>(null);

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
    let mounted = true;

    (async () => {
      await Promise.allSettled([Feather.loadFont(), Ionicons.loadFont()]);
      if (mounted) {
        setIconsReady(true);
      }
      const savedLocale = await AsyncStorage.getItem(LOCALE_KEY);
      if (savedLocale && ['en', 'es', 'fr', 'de', 'pt', 'ar', 'zh', 'ru'].includes(savedLocale)) {
        setLocale(savedLocale as Locale);
      }
      const savedLocationConsent = await AsyncStorage.getItem(LOCATION_CONSENT_KEY);
      if (savedLocationConsent === 'granted') {
        setLocationConsent(true);
        const coords = await requestCurrentCoordinates();
        if (coords) {
          setDeviceLocation(coords);
        } else {
          setLocationConsent(false);
          setLocationPromptError(t(locale, 'common.locationRequired'));
          await AsyncStorage.removeItem(LOCATION_CONSENT_KEY);
        }
      } else {
        setLocationConsent(false);
      }

      const token = await hydrateAuthToken();
      if (!token) {
        if (mounted) {
          setReady(true);
          setSession('auth');
        }
        return;
      }

      if (mounted) {
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
      mounted = false;
    };
  }, [loadCatalog]);

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

  const requestLocationConsent = useCallback(async () => {
    setLocationPromptError(null);
    const coords = await requestCurrentCoordinates();
    if (coords) {
      setDeviceLocation(coords);
      setLocationConsent(true);
      await AsyncStorage.setItem(LOCATION_CONSENT_KEY, 'granted');
      return true;
    }

    setLocationConsent(false);
    setLocationPromptError(t(locale, 'common.locationRequired'));
    await AsyncStorage.removeItem(LOCATION_CONSENT_KEY);
    return false;
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

  const showLocationGate = session === 'app' && locationConsent !== true;

  if (!ready || !iconsReady) {
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
        style={shellStyles.topBarSafeArea}
      >
        {/* Header content */}
      </SafeAreaView>
      <StatusBar
        showHideTransition={'slide'}
        barStyle={'light-content'}
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
          {showLocationGate ? (
            <View style={shellStyles.locationGate}>
              <View style={shellStyles.locationGateCard}>
                <Text style={shellStyles.locationGateTitle}>{t(locale, 'common.locationRequired')}</Text>
                <Text style={shellStyles.locationGateBody}>{t(locale, 'common.locationRequiredBody')}</Text>
                <Text style={shellStyles.locationGateHint}>{t(locale, 'common.locationRequiredHint')}</Text>
                <View style={shellStyles.locationGateActions}>
                  <Pressable
                    onPress={() => {
                      void requestLocationConsent();
                    }}
                    style={({ pressed }) => [
                      {
                        borderRadius: 18,
                        paddingVertical: 14,
                        alignItems: 'center',
                        backgroundColor: '#00d4ff',
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={{ color: '#08111f', fontFamily: 'Poppins-SemiBold' }}>{t(locale, 'common.allowLocation')}</Text>
                  </Pressable>
                  <Text style={shellStyles.locationGateError}>{locationPromptError ?? ''}</Text>
                </View>
              </View>
            </View>
          ) : null}
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
                  tabBarActiveTintColor: '#c8f36a',
                  tabBarInactiveTintColor: '#7f8ca6',
                  tabBarLabelStyle: {
                    fontFamily: fonts.tab,
                    fontSize: 9,
                    marginBottom: 1,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  },
                  tabBarStyle: {
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 12,
                    borderTopWidth: 0,
                    borderRadius: 28,
                    backgroundColor: 'rgba(9, 15, 29, 0.88)',
                    height: 74,
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingHorizontal: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(157, 245, 255, 0.12)',
                    shadowColor: '#000',
                    shadowOpacity: 0.24,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 10,
                  },
                  tabBarItemStyle: {
                    paddingTop: 4,
                    borderRadius: 18,
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
                    {() => <HubRoute locale={locale} currentLocation={deviceLocation} />}
                  </AppStack.Screen>
                  <AppStack.Screen name="Wayfinding">
                    {() => <WayfindingRoute locale={locale} />}
                  </AppStack.Screen>
                  <AppStack.Screen name="Journey">
                    {() => <JourneyRoute locale={locale} currentLocation={deviceLocation} />}
                  </AppStack.Screen>
                  <AppStack.Screen name="Mobility">
                    {() => <MobilityRoute locale={locale} />}
                  </AppStack.Screen>
                  <AppStack.Screen name="Profile">
                    {() => (
                      <ProfileRoute
                        locale={locale}
                        selectedMatch={selectedMatch}
                        onProfileUpdated={refreshUserProfile}
                        onLocaleChange={(nextLocale) => {
                          void handleLocaleChange(nextLocale);
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
