import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, type NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchCatalog } from './src/catalog';
import { detectLanguage, t, type Locale } from './src/i18n';
import { AuthScreen } from './src/screens/AuthScreen';
import { HubScreen } from './src/screens/HubScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { PassScreen } from './src/screens/PassScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WayfindingScreen } from './src/screens/WayfindingScreen';
import type { LiveData } from './src/types';

const fonts = {
  tab: 'Poppins-SemiBold',
};

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

type CatalogShellState = {
  catalog: LiveData | null;
  catalogLoading: boolean;
  catalogError: string | null;
  onRetryCatalog: () => void;
};

const CatalogShellContext = createContext<CatalogShellState | null>(null);

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function useCatalogShell() {
  const value = useContext(CatalogShellContext);
  if (!value) {
    throw new Error('Catalog shell context is missing');
  }

  return value;
}

function HubRoute() {
  const { catalog, catalogLoading, catalogError, onRetryCatalog } = useCatalogShell();
  return <HubScreen data={catalog} loading={catalogLoading} error={catalogError} onRetryCatalog={onRetryCatalog} />;
}

function JourneyRoute() {
  const { catalog, catalogLoading } = useCatalogShell();
  return <JourneyScreen data={catalog} loading={catalogLoading} />;
}

function ProfileRoute() {
  const { catalog, catalogLoading } = useCatalogShell();
  return <ProfileScreen data={catalog} loading={catalogLoading} />;
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const locale = useMemo<Locale>(() => detectLanguage(), []);
  const [signedIn, setSignedIn] = useState(false);
  const [catalog, setCatalog] = useState<LiveData | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const nextCatalog = await fetchCatalog();
      setCatalog(nextCatalog);
    } catch {
      setCatalog(null);
      setCatalogError('Live backend catalog unavailable.');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!signedIn) {
      setCatalog(null);
      setCatalogError(null);
      setCatalogLoading(false);
      return;
    }

    loadCatalog();
  }, [loadCatalog, signedIn]);

  return (
    <SafeAreaProvider>
      {Platform.OS === 'android'
        ? React.createElement(StatusBar as any, { barStyle: isDarkMode ? 'light-content' : 'dark-content', backgroundColor: isDarkMode ? '#0b1220' : '#f6f8fc' })
        : React.createElement(StatusBar as any, { barStyle: isDarkMode ? 'light-content' : 'dark-content' })}
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!signedIn ? (
            <RootStack.Screen name="Auth">
              {() => <AuthScreen locale={locale} onAuthenticated={() => setSignedIn(true)} />}
            </RootStack.Screen>
          ) : (
            <RootStack.Screen name="App">
              {() => (
                <MainTabs
                  locale={locale}
                  catalog={catalog}
                  catalogLoading={catalogLoading}
                  catalogError={catalogError}
                  onRetryCatalog={loadCatalog}
                />
              )}
            </RootStack.Screen>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
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
  }
  return name;
}

function MainTabs({
  locale,
  catalog,
  catalogLoading,
  catalogError,
  onRetryCatalog,
}: CatalogShellState & { locale: Locale }) {
  const shellValue = {
    catalog,
    catalogLoading,
    catalogError,
    onRetryCatalog,
  };

  return (
    <CatalogShellContext.Provider value={shellValue}>
      <Tab.Navigator
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
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, size }) => {
            switch (route.name) {
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
          },
        })}
      >
        <Tab.Screen name="Hub" component={HubRoute} />
        <Tab.Screen name="Wayfinding" component={WayfindingScreen} />
        <Tab.Screen name="Journey" component={JourneyRoute} />
        <Tab.Screen name="Pass" component={PassScreen} />
        <Tab.Screen name="Profile" component={ProfileRoute} />
      </Tab.Navigator>
    </CatalogShellContext.Provider>
  );
}

export default App;
