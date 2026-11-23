import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { acceptRideRequest, createRideRequest, getRideRequest, getSessionUser, getAuthToken, isDriverSession, listDriverRideRequests, listPublicTransportProfiles, refuseRideRequest } from '../api';
import { getScreenCopy } from '../screenCopy';
import { googleMapsDirectionsUrl, openGoogleMapsDirections } from '../maps';
import { Card, EmptyState, Pill, PrimaryButton, SecondaryButton, styles } from '../ui';
import type { LiveData, MatchCard, RideRequestView, TransportProviderView } from '../types';
import { t, type Locale } from '../i18n';

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

type ModeKey = 'bus' | 'train' | 'metro' | 'scooter' | 'bike' | 'taxi' | 'vtc';

const modeCards: Array<{ key: ModeKey; label: string; subtitle: string; icon: React.ReactNode; regex: RegExp }> = [
  { key: 'bus', label: 'Bus', subtitle: 'Walk to the station', icon: <Ionicons name="bus-outline" size={20} color="#172033" />, regex: /bus/i },
  { key: 'train', label: 'Train', subtitle: 'Walk to the station', icon: <Ionicons name="train-outline" size={20} color="#172033" />, regex: /train/i },
  { key: 'metro', label: 'Metro', subtitle: 'Walk to the station', icon: <Ionicons name="subway-outline" size={20} color="#172033" />, regex: /metro|subway/i },
  { key: 'scooter', label: 'Scooter', subtitle: 'Walk to the scooter', icon: <Feather name="navigation" size={20} color="#172033" />, regex: /scooter/i },
  { key: 'bike', label: 'Bike', subtitle: 'Walk to the bike', icon: <Feather name="map-pin" size={20} color="#172033" />, regex: /bike|bicycle/i },
  { key: 'taxi', label: 'Taxi', subtitle: 'Send a live request', icon: <Ionicons name="car-outline" size={20} color="#172033" />, regex: /taxi/i },
  { key: 'vtc', label: 'VTC', subtitle: 'Send a live request', icon: <Ionicons name="car-sport-outline" size={20} color="#172033" />, regex: /vtc|chauffeur|driver/i },
];

function modeFromProvider(providerType: string): ModeKey {
  const normalized = providerType.toLowerCase();
  return modeCards.find((mode) => mode.regex.test(normalized))?.key ?? 'vtc';
}

function buildDestinationOptions(match: MatchCard) {
  return [match.venue, `${match.gate} gate`, `${match.sector} sector`, `${match.city} center`].filter(
    (label, index, items) => Boolean(label) && items.indexOf(label) === index,
  );
}

function destinationLabelToQuery(match: MatchCard, label: string) {
  return `${label}, ${match.city}, ${match.country}`;
}

export function JourneyScreen({
  data,
  loading: _loading,
  locale,
  selectedMatch,
}: {
  data: LiveData | null;
  loading: boolean;
  locale: Locale;
  selectedMatch: MatchCard | null;
}) {
  const copy = getScreenCopy(locale).journey;
  const match = selectedMatch ?? data?.matches?.[0] ?? null;
  const venueCoordinateQuery = match ? `${match.venue}, ${match.city}, ${match.country}` : 'stadium';

  const [providers, setProviders] = useState<TransportProviderView[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<ModeKey>('vtc');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [rideRequest, setRideRequest] = useState<RideRequestView | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [driverRequests, setDriverRequests] = useState<RideRequestView[]>([]);
  const [driverRequestsLoading, setDriverRequestsLoading] = useState(false);
  const isDriver = isDriverSession();

  const destinationOptions = useMemo(() => (match ? buildDestinationOptions(match) : []), [match]);

  useEffect(() => {
    if (!match) {
      setProviders([]);
      setSelectedDestination('');
      return;
    }
    setSelectedDestination((current) => (current && destinationOptions.includes(current) ? current : destinationOptions[0] ?? match.venue));
  }, [destinationOptions, match]);

  const reloadProviders = useMemo(() => {
    return async () => {
      if (!match) {
        setProviders([]);
        return;
      }
      setProvidersLoading(true);
      try {
        const live = await listPublicTransportProfiles(match.id);
        setProviders(live);
      } catch {
        setProviders([]);
      } finally {
        setProvidersLoading(false);
      }
    };
  }, [match]);

  useEffect(() => {
    void reloadProviders();
  }, [reloadProviders]);

  useEffect(() => {
    if (!match) return;
    const timer = setInterval(() => {
      void reloadProviders();
    }, 12000);
    return () => clearInterval(timer);
  }, [match, reloadProviders]);

  const availableModes = useMemo(() => {
    const counts = new Map<ModeKey, number>();
    for (const provider of providers) {
      const mode = modeFromProvider(provider.providerType);
      counts.set(mode, (counts.get(mode) ?? 0) + (provider.active || provider.ready ? 1 : 0));
    }
    return counts;
  }, [providers]);

  const filteredProviders = useMemo(
    () => providers.filter((provider) => modeFromProvider(provider.providerType) === activeMode),
    [providers, activeMode],
  );

  useEffect(() => {
    if (!match || !isDriver) {
      setDriverRequests([]);
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      setDriverRequestsLoading(true);
      try {
        const providerType = modeCards.find((mode) => mode.key === activeMode)?.label ?? 'VTC';
        const live = await listDriverRideRequests(match.id, providerType);
        if (!cancelled) {
          setDriverRequests(live);
        }
      } catch {
        if (!cancelled) {
          setDriverRequests([]);
        }
      } finally {
        if (!cancelled) {
          setDriverRequestsLoading(false);
        }
      }
    };
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 6000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeMode, isDriver, match]);

  useEffect(() => {
    if (!rideRequest) return;
    const timer = setInterval(async () => {
      try {
        const current = await getRideRequest(rideRequest.id);
        setRideRequest(current);
        if (current.status === 'ACCEPTED') {
          setStatusMessage(`${current.driverDisplayName ?? 'Driver'} accepted your request and is coming to your pickup point.`);
        } else if (current.status === 'REFUSED') {
          setStatusMessage('The driver refused this request. Select another available chauffeur.');
        }
      } catch {
        // keep last state
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [rideRequest]);

  const reserveRide = async (provider: TransportProviderView) => {
    if (!match) return;
    setRequestLoading(true);
    setRequestError(null);
    try {
      const me = getSessionUser();
      const hasToken = Boolean(getAuthToken());
      if (!me?.email && !hasToken) {
        setRequestError('Sign in again to send a live transport request.');
        setRequestLoading(false);
        return;
      }
      const request = await createRideRequest({
        matchId: match.id,
        matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
        passengerEmail: me?.email,
        passengerName: me?.fullName,
        providerType: provider.providerType,
        pickupLabel: `${match.city} live pickup`,
        destinationLabel: selectedDestination || match.venue,
        note: `Live ride request for ${provider.displayName}`,
      });
      setRideRequest(request);
      setStatusMessage(`Request sent to ${provider.displayName}. Waiting for driver response.`);
      if (provider.providerType.toLowerCase().includes('taxi') || provider.providerType.toLowerCase().includes('vtc')) {
        return;
      }
      await Linking.openURL(googleMapsDirectionsUrl(destinationLabelToQuery(match, selectedDestination || match.venue)));
    } catch {
      setRequestError('The ride request could not be created. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const requestSummary = rideRequest
    ? `${rideRequest.providerType} · ${rideRequest.status} · ${rideRequest.pickupLabel} → ${rideRequest.destinationLabel}`
    : null;

  if (!match) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Card title={copy.title} subtitle={copy.subtitle} wide>
            <EmptyState icon="calendar-outline" title={t(locale, 'common.noMatchSelected')} subtitle={t(locale, 'common.selectMatchFirstBody')} />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const mapQuery = selectedDestination ? destinationLabelToQuery(match, selectedDestination) : venueCoordinateQuery;

  if (isDriver) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.heroRow}>
            <View style={[styles.card, styles.cardWide]}>
              <Text style={styles.kicker}>{t(locale, 'journey.title')}</Text>
              <Text style={styles.title}>{match.homeTeam} vs {match.awayTeam}</Text>
              <Text style={styles.subtitle}>{match.venue} · {match.city}</Text>
              <Text style={styles.muted}>{t(locale, 'common.liveTracking')}</Text>
            </View>
          </View>

          <Card title={t(locale, 'common.liveTracking')} subtitle={t(locale, 'common.availableChauffeurs')}>
            {driverRequestsLoading ? (
              <Text style={styles.muted}>{t(locale, 'common.loading')}</Text>
            ) : driverRequests.length ? (
              <View style={styles.grid2}>
                {driverRequests.map((request) => (
                  <View key={request.id} style={styles.miniCard}>
                    <Text style={styles.miniCardTitle}>{request.passengerName}</Text>
                    <Text style={styles.muted}>{request.pickupLabel}</Text>
                    <Text style={styles.miniCardMeta}>{request.destinationLabel}</Text>
                    <Text style={styles.muted}>{request.status}</Text>
                    <View style={styles.ctaRow}>
                      <SecondaryButton
                        label={t(locale, 'common.refuse')}
                        onPress={() => {
                          void refuseRideRequest(request.id);
                        }}
                      />
                      <PrimaryButton
                        label={t(locale, 'common.accept')}
                        onPress={() => {
                          void acceptRideRequest(request.id);
                        }}
                        icon={<Ionicons name="checkmark" size={16} color="#172033" />}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="car-sport-outline" title={t(locale, 'common.noLiveReservation')} subtitle={t(locale, 'common.liveTracking')} />
            )}
          </Card>

          <View style={styles.card}>
            <MapView
              style={{ height: 280, borderRadius: 20 }}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 40.4531,
                longitude: -3.6883,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              showsTraffic
            >
              <Marker coordinate={{ latitude: 40.4531, longitude: -3.6883 }} title={match.venue} description={`${match.city}, ${match.country}`} />
            </MapView>
            <Text style={styles.muted}>{t(locale, 'common.pickupTracking')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{match.homeTeam} vs {match.awayTeam}</Text>
        </View>

        <Card title={t(locale, 'common.liveMap')} subtitle={t(locale, 'common.pickupTracking')} wide>
          <View style={styles.mapPanel}>
            <MapView
              style={styles.mapView}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 40.4531,
                longitude: -3.6883,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              showsCompass={false}
              showsTraffic
            >
              <Marker coordinate={{ latitude: 40.4531, longitude: -3.6883 }} title={selectedDestination || match.venue} description={`${match.city}, ${match.country}`} />
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.cardTitle}>{selectedDestination || match.venue}</Text>
              <Text style={styles.muted}>{match.city}, {match.country}</Text>
              <Text style={styles.muted}>{formatCountdown(match.date, match.time)} · {match.transitSummary}</Text>
            </View>
          </View>
        </Card>

        <Card title="Available transport modes" subtitle="Pick your live ride type" wide>
          <View style={styles.chipsRow}>
            {modeCards.map((mode) => (
              <Pressable
                key={mode.key}
                onPress={() => setActiveMode(mode.key)}
                style={[styles.tabChip, activeMode === mode.key && styles.tabChipActive]}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIcon}>{mode.icon}</View>
                  <Text style={[styles.tabChipText, activeMode === mode.key && styles.tabChipTextActive]}>{mode.label}</Text>
                </View>
                <Text style={styles.helperText}>{availableModes.get(mode.key) ?? 0} available · {mode.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card title={t(locale, 'common.destination')} subtitle={t(locale, 'common.chooseFinalDestination')} wide>
          <View style={styles.chipsRow}>
            {destinationOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSelectedDestination(option)}
                style={[styles.tabChip, selectedDestination === option && styles.tabChipActive]}
              >
                <Text style={styles.tabChipText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card title={t(locale, 'common.availableChauffeurs')} subtitle={t(locale, 'common.instantBooking')} wide>
          {providersLoading ? (
            <EmptyState icon="loader-outline" title={t(locale, 'common.loading')} subtitle={t(locale, 'common.loading')} />
          ) : filteredProviders.length ? (
            <View style={styles.cardBody}>
              {filteredProviders.map((provider) => {
                const isReady = provider.active || provider.ready;
                return (
                  <View key={provider.id} style={styles.miniCard}>
                    <View style={styles.rowBetween}>
                      <View style={styles.rowLeft}>
                        <Text style={styles.cardTitle}>{provider.displayName}</Text>
                        <Text style={styles.muted}>{provider.driverName} · {provider.vehicleLabel}</Text>
                      </View>
                      <Pill subtle={isReady}>{isReady ? t(locale, 'common.available') : t(locale, 'common.notAvailable')}</Pill>
                    </View>
                    <Text style={styles.muted}>{provider.vehiclePlate} · {provider.city}, {provider.country}</Text>
                    {provider.publicNotes ? <Text style={styles.helperText}>{provider.publicNotes}</Text> : null}
                    <View style={styles.ctaRow}>
                      <PrimaryButton
                        label={provider.providerType.toLowerCase().includes('taxi') || provider.providerType.toLowerCase().includes('vtc')
                          ? t(locale, 'common.sendRequest')
                          : t(locale, 'common.navigate')}
                        onPress={() => void reserveRide(provider)}
                        icon={<Ionicons name="car-outline" size={16} color="#172033" />}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyState icon="car-outline" title={t(locale, 'common.noProviders')} subtitle={t(locale, 'common.changeEvent')} />
          )}
        </Card>

        <Card title={t(locale, 'common.liveRiderTracking')} subtitle={t(locale, 'common.liveTracking')} wide>
          {rideRequest ? (
            <View style={styles.cardBody}>
              <View style={styles.rowBetween}>
                <View style={styles.rowLeft}>
                  <Text style={styles.cardTitle}>{rideRequest.status}</Text>
                  <Text style={styles.muted}>{requestSummary}</Text>
                </View>
                <Pill subtle={rideRequest.status === 'ACCEPTED'}>{rideRequest.status}</Pill>
              </View>
              <Text style={styles.helperText}>
                {rideRequest.status === 'PENDING'
                  ? 'The request has been sent to the driver. Waiting for accept or refuse.'
                  : rideRequest.status === 'ACCEPTED'
                    ? 'The driver is coming to your pickup point and the route is live.'
                    : 'The driver refused the request. Select another available chauffeur.'}
              </Text>
              {statusMessage ? <Text style={styles.helperText}>{statusMessage}</Text> : null}
              <View style={styles.ctaRow}>
                <SecondaryButton label={t(locale, 'common.openInMaps')} onPress={() => void openGoogleMapsDirections(mapQuery)} icon={<Feather name="map" size={16} color="#1d3fb3" />} />
              </View>
            </View>
          ) : (
            <EmptyState icon="radio-outline" title={t(locale, 'common.noLiveReservation')} subtitle={t(locale, 'common.liveTracking')} />
          )}
          {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}
          {requestLoading ? <Text style={styles.helperText}>{t(locale, 'common.loading')}</Text> : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
