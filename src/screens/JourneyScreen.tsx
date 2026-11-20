import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getScreenCopy } from '../screenCopy';
import { openGoogleMapsDirections, openGoogleMapsSearch } from '../maps';
import { Card, EmptyState, Pill, PrimaryButton, SecondaryButton, styles } from '../ui';
import type { LiveData, MatchCard, TransportProviderView } from '../types';
import { t, type Locale } from '../i18n';

type ModeKey = 'taxi' | 'vtc' | 'shuttle' | 'bus' | 'train' | 'walking';

type ModeCard = {
  key: ModeKey;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
};

function getModeCards(locale: Locale): ModeCard[] {
  return [
    { key: 'taxi', label: t(locale, 'journey.taxiLabel'), subtitle: t(locale, 'journey.taxiSubtitle'), icon: <Ionicons name="car-outline" size={18} color="#172033" /> },
    { key: 'vtc', label: t(locale, 'journey.vtcLabel'), subtitle: t(locale, 'journey.vtcSubtitle'), icon: <Feather name="navigation" size={18} color="#172033" /> },
    { key: 'shuttle', label: t(locale, 'journey.shuttleLabel'), subtitle: t(locale, 'journey.shuttleSubtitle'), icon: <Ionicons name="bus-outline" size={18} color="#172033" /> },
    { key: 'bus', label: t(locale, 'journey.busLabel'), subtitle: t(locale, 'journey.busSubtitle'), icon: <Feather name="bus" size={18} color="#172033" /> },
    { key: 'train', label: t(locale, 'journey.trainLabel'), subtitle: t(locale, 'journey.trainSubtitle'), icon: <Feather name="train" size={18} color="#172033" /> },
    { key: 'walking', label: t(locale, 'journey.walkingLabel'), subtitle: t(locale, 'journey.walkingSubtitle'), icon: <Feather name="map-pin" size={18} color="#172033" /> },
  ];
}


const venueCoordinate = { latitude: 40.4531, longitude: -3.6883 };
const pickupCoordinate = { latitude: 40.4602, longitude: -3.6798 };

function formatCountdown(date: string, time: string) {
  const target = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}`);
  if (Number.isNaN(target.getTime())) return 'LIVE';
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'LIVE';
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

function modeFromProvider(providerType: string): ModeKey {
  const value = providerType.trim().toLowerCase();
  if (value.includes('taxi')) return 'taxi';
  if (value.includes('vtc') || value.includes('ride')) return 'vtc';
  if (value.includes('shuttle')) return 'shuttle';
  if (value.includes('bus')) return 'bus';
  if (value.includes('train')) return 'train';
  return 'walking';
}

function driverOffset(mode: ModeKey, progress: number) {
  const start = {
    taxi: { latitude: 40.4688, longitude: -3.6994 },
    vtc: { latitude: 40.4699, longitude: -3.672 },
    shuttle: { latitude: 40.451, longitude: -3.72 },
    bus: { latitude: 40.4415, longitude: -3.667 },
    train: { latitude: 40.432, longitude: -3.701 },
    walking: { latitude: 40.4575, longitude: -3.6835 },
  }[mode];
  return {
    latitude: start.latitude + (pickupCoordinate.latitude - start.latitude) * progress,
    longitude: start.longitude + (pickupCoordinate.longitude - start.longitude) * progress,
  };
}

export function JourneyScreen({ data, loading: _loading, locale, selectedMatch }: { data: LiveData | null; loading: boolean; locale: Locale; selectedMatch: MatchCard | null }) {
  const copy = getScreenCopy(locale).journey;
  const match = selectedMatch;
  const providers = useMemo(() => data?.transportProviders ?? [], [data?.transportProviders]);
  const modeCards = useMemo(() => getModeCards(locale), [locale]);
  const liveProviders = useMemo(() => providers.filter((provider) => provider.active && provider.ready), [providers]);
  const modeSummary = useMemo(() => {
    const counts = new Map<ModeKey, number>();
    for (const provider of liveProviders) {
      const mode = modeFromProvider(provider.providerType);
      counts.set(mode, (counts.get(mode) ?? 0) + 1);
    }
    return counts;
  }, [liveProviders]);

  const availableModes = useMemo(() => {
    const modes = modeCards.filter((item) => (modeSummary.get(item.key) ?? 0) > 0);
    return modes.length ? modes : modeCards;
  }, [modeSummary, modeCards]);

  const [activeMode, setActiveMode] = useState<ModeKey>('taxi');
  const [_activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [reservedProvider, setReservedProvider] = useState<TransportProviderView | null>(null);
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredProviders = useMemo(() => {
    if (!match) return [];
    return liveProviders.filter((provider) => provider.matchId === match.id && modeFromProvider(provider.providerType) === activeMode);
  }, [activeMode, match, liveProviders]);


  useEffect(() => {
    if (!filteredProviders.length) {
      setActiveProviderId(null);
      return;
    }
    setActiveProviderId(filteredProviders[0].id);
  }, [filteredProviders]);

  useEffect(() => {
    if (!reservedProvider) {
      setTrackingProgress(0);
      return;
    }
    setTrackingProgress(0);
    const timer = setInterval(() => {
      setTrackingProgress((current) => (current >= 1 ? 1 : Math.min(1, current + 0.08)));
    }, 1200);
    return () => clearInterval(timer);
  }, [reservedProvider]);

  const countdown = match ? formatCountdown(match.date, match.time) : 'LIVE';
  const driverCoordinate = reservedProvider ? driverOffset(modeFromProvider(reservedProvider.providerType), trackingProgress) : null;
  const routeLine = driverCoordinate ? [driverCoordinate, pickupCoordinate] : [];
  const journeyLine = reservedProvider ? [pickupCoordinate, venueCoordinate] : [];

  const reserveNow = async (provider: TransportProviderView) => {
    setActiveProviderId(provider.id);
    setReservedProvider(provider);
    setTrackingProgress(0);
    setStatusMessage(`Reserved ${provider.displayName}. Driver is on the way to your pickup point.`);
    if (match) {
      await openGoogleMapsDirections(`${match.venue}, ${match.city}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <Card title={t(locale, 'common.liveMap')} subtitle={t(locale, 'common.pickupTracking')} wide>
          {match ? (
            <View style={styles.mapPanel}>
              <MapView
                style={styles.mapView}
                initialRegion={{
                  latitude: venueCoordinate.latitude,
                  longitude: venueCoordinate.longitude,
                  latitudeDelta: 0.04,
                  longitudeDelta: 0.04,
                }}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                showsCompass={false}
                showsTraffic
              >
                <Marker coordinate={venueCoordinate} title={match.venue} description={`${match.gate} · ${match.sector}`} />
                {driverCoordinate ? (
                  <>
                    <Marker coordinate={driverCoordinate} title={reservedProvider?.displayName ?? 'Driver'} description="Live driver position" pinColor="#c8f36a" />
                    <Polyline coordinates={routeLine} strokeColor="#c8f36a" strokeWidth={4} />
                    {reservedProvider ? <Polyline coordinates={journeyLine} strokeColor="#2457e6" strokeWidth={4} lineDashPattern={[8, 6]} /> : null}
                  </>
                ) : (
                  <Marker coordinate={pickupCoordinate} title="Your pickup point" description="Current pickup area" pinColor="#2457e6" />
                )}
              </MapView>
              <View style={styles.mapOverlay}>
                <Text style={styles.cardTitle}>{match.homeTeam} vs {match.awayTeam}</Text>
                <Text style={styles.muted}>{match.venue} · {match.city}</Text>
                <Text style={styles.muted}>Gate {match.gate} · Sector {match.sector} · Countdown {countdown}</Text>
              </View>
            </View>
          ) : (
            <EmptyState icon="map-outline" title={t(locale, 'common.selectMatchFirst')} subtitle={t(locale, 'common.selectMatchFirstBody')} />
          )}
          <View style={styles.ctaRow}>
            <PrimaryButton
              label={t(locale, 'common.openInGoogleMaps')}
              onPress={() => match ? openGoogleMapsSearch(`${match.venue}, ${match.city}`) : undefined}
              icon={<Ionicons name="navigate-outline" size={16} color="#172033" />}
            />
            <SecondaryButton
              label={t(locale, 'common.findVenue')}
              onPress={() => match ? openGoogleMapsSearch(`${match.venue}, ${match.city}`) : undefined}
              icon={<Feather name="search" size={16} color="#1d3fb3" />}
            />
          </View>
        </Card>

        <Card title={t(locale, 'common.transportModes')} subtitle={t(locale, 'common.tapOneToSeeAvailableProviders')} wide>
          <View style={styles.grid2}>
            {availableModes.map((mode) => (
              <Pressable
                key={mode.key}
                onPress={() => {
                  setActiveMode(mode.key);
                  setReservedProvider(null);
                  setStatusMessage(null);
                }}
                style={[localStyles.modeCard, activeMode === mode.key && localStyles.modeCardActive]}
              >
                <View style={localStyles.modeIcon}>{mode.icon}</View>
                <Text style={localStyles.modeTitle}>{mode.label}</Text>
                <Text style={localStyles.modeSubtitle}>{mode.subtitle}</Text>
                <Text style={localStyles.modeMeta}>{modeSummary.get(mode.key) ?? 0} available</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card title={t(locale, 'common.availableChauffeurs')} subtitle={t(locale, 'common.instantBooking')} wide>
          {match ? (
            filteredProviders.length ? (
              <View style={styles.cardBody}>
                {filteredProviders.map((provider) => {
                  const isActive = provider.active;
                  const isReady = provider.ready;
                  return (
                    <View key={provider.id} style={localStyles.providerCard}>
                      <View style={styles.rowBetween}>
                        <View style={styles.rowLeft}>
                          <Text style={localStyles.providerTitle}>{provider.displayName}</Text>
                          <Text style={styles.muted}>{provider.providerType} · {provider.zone}</Text>
                        </View>
                        <View style={styles.rowRight}>
                          <Pill subtle={isActive}>{isActive ? t(locale, 'common.active') : t(locale, 'common.paused')}</Pill>
                        </View>
                      </View>
                      <Text style={styles.muted}>{provider.driverName} · {provider.vehicleLabel}</Text>
                      <Text style={styles.muted}>{provider.vehiclePlate} · {provider.city}, {provider.country}</Text>
                      {provider.publicNotes ? <Text style={localStyles.providerNotes}>{provider.publicNotes}</Text> : null}
                      <View style={styles.ctaRow}>
                        <PrimaryButton
                          label={isActive && isReady ? t(locale, 'common.reserveNow') : t(locale, 'common.notAvailable')}
                          onPress={() => isActive && isReady ? reserveNow(provider) : undefined}
                          icon={<Ionicons name="car-outline" size={16} color="#172033" />}
                        />
                        <SecondaryButton
                          label={t(locale, 'common.trackLive')}
                          onPress={() => {
                            setReservedProvider(provider);
                            setStatusMessage(`Tracking ${provider.displayName} live.`);
                          }}
                          icon={<Feather name="activity" size={16} color="#1d3fb3" />}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
            <EmptyState icon="car-outline" title={t(locale, 'common.noProviders')} subtitle={t(locale, 'common.changeEvent')} />
            )
          ) : (
            <EmptyState icon="calendar-outline" title={t(locale, 'common.noMatchSelected')} subtitle={t(locale, 'common.selectMatchFirstBody')} />
          )}
        </Card>

        <Card title={t(locale, 'common.liveRiderTracking')} subtitle={t(locale, 'common.liveTracking')} wide>
          {reservedProvider ? (
            <View style={styles.mapPanel}>
              <MapView
                style={styles.mapView}
                initialRegion={{
                  latitude: venueCoordinate.latitude,
                  longitude: venueCoordinate.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              >
                <Marker coordinate={pickupCoordinate} title="Your pickup point" description="Pickup location" pinColor="#2457e6" />
                {driverCoordinate ? <Marker coordinate={driverCoordinate} title={reservedProvider.displayName} description="Driver live position" pinColor="#c8f36a" /> : null}
                {driverCoordinate ? <Polyline coordinates={routeLine} strokeColor="#c8f36a" strokeWidth={4} /> : null}
                {reservedProvider ? <Polyline coordinates={journeyLine} strokeColor="#2457e6" strokeWidth={4} lineDashPattern={[8, 6]} /> : null}
              </MapView>
              <View style={styles.mapOverlay}>
                <Text style={styles.cardTitle}>{reservedProvider.displayName}</Text>
                <Text style={styles.muted}>{reservedProvider.driverName} · {reservedProvider.vehicleLabel}</Text>
                <Text style={styles.muted}>{reservedProvider.vehiclePlate} · ETA {Math.max(2, Math.round(12 * (1 - trackingProgress)))} min</Text>
                <Text style={styles.muted}>Driver moving toward your pickup point. Follow the live pin in the map.</Text>
              </View>
            </View>
          ) : (
            <EmptyState icon="radio-outline" title={t(locale, 'common.noLiveReservation')} subtitle={t(locale, 'common.liveTracking')} />
          )}
          {statusMessage ? <Text style={styles.helperText}>{statusMessage}</Text> : null}
        </Card>

        <Card title={copy.checkoutTitle} subtitle={copy.checkoutSubtitle}>
          <View style={styles.bulletRow}>
            <Feather name="info" size={16} color="#2457e6" />
            <Text style={styles.muted}>Tap a provider above to reserve instantly like Uber or DiDi. The driver is routed to your pickup point and the live map follows the current position.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="location-outline" size={16} color="#2457e6" />
            <Text style={styles.muted}>This view is now focused on live transport, not match details. Match info stays in the hub and map views.</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = {
  modeCard: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe4ff',
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  modeCardActive: {
    backgroundColor: '#edf2ff',
    borderColor: '#2457e6',
  },
  modeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#c8f36a',
  },
  modeTitle: {
    color: '#172033',
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
  },
  modeSubtitle: {
    color: '#60708b',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  modeMeta: {
    color: '#2457e6',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  providerCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6eaf0',
    backgroundColor: '#fff',
    gap: 8,
  },
  providerTitle: {
    color: '#172033',
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
  },
  providerNotes: {
    color: '#172033',
    fontFamily: 'Poppins-Medium',
  },
};
