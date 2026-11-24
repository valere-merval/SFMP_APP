import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { acceptRideRequest, createRideRequest, getRideRequest, getSessionUser, getAuthToken, listAssignedDriverRideRequests, listDriverRideRequests, listPassengerRideRequests, listPublicTransportProfiles, loadTransportAvailability, refuseRideRequest, markRideRequestArrived, startRideRequestTrip, completeRideRequestTrip } from '../api';
import { getScreenCopy } from '../screenCopy';
import { googleMapsDirectionsUrl, openGoogleMapsDirections, buildRideRouteCoordinates, rideStatusStyle } from '../maps';
import { Card, EmptyState, Pill, PrimaryButton, SecondaryButton, styles } from '../ui';
import type { LiveData, MatchCard, RideRequestView, TransportAvailabilityView, TransportProviderView } from '../types';
import { t, type Locale } from '../i18n';

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

function rideStatusCopy(status?: RideRequestView['status'] | null) {
  const meta = rideStatusStyle(status);
  if (status === 'ACCEPTED') {
    return {
      badge: meta.label,
      title: 'Driver is on the way',
      subtitle: 'Live tracking begins now',
      detail: 'Route to pickup is active and updates in real time.',
    };
  }
  if (status === 'ARRIVED_AT_PICKUP') {
    return {
      badge: meta.label,
      title: 'Driver arrived at pickup',
      subtitle: 'Passenger is being collected',
      detail: 'Hold position until the passenger confirms boarding.',
    };
  }
  if (status === 'IN_PROGRESS') {
    return {
      badge: meta.label,
      title: 'Trip in progress',
      subtitle: 'Destination route is live',
      detail: 'Follow the final route to the selected destination.',
    };
  }
  if (status === 'COMPLETED') {
    return {
      badge: meta.label,
      title: 'Trip completed',
      subtitle: 'Ready for the next request',
      detail: 'Passenger has reached the destination.',
    };
  }
  return {
    badge: meta.label,
    title: 'Live request tracking',
    subtitle: 'Waiting for the next step',
    detail: 'Accept a ride to show live pickup and destination routing.',
  };
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
  const [driverAvailability, setDriverAvailability] = useState<TransportAvailabilityView | null>(null);
  const currentSessionUser = getSessionUser();
  const currentSessionEmail = currentSessionUser?.email ?? '';
  const currentDriverEmail = currentSessionEmail;
  const isDriver = driverAvailability?.available === true;

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
    if (!match) {
      setDriverAvailability(null);
      return;
    }

    let mounted = true;
    const refresh = async () => {
      try {
        const live = await loadTransportAvailability(match.id);
        if (!mounted) return;
        setDriverAvailability(live);
      } catch {
        if (!mounted) return;
        setDriverAvailability(null);
      }
    };

    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 9000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [match]);

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
        const providerTypes = ['Taxi', 'VTC'];
        const [pendingBatches, assigned] = await Promise.all([
          Promise.all(providerTypes.map((providerType) => listDriverRideRequests(match.id, providerType).catch(() => []))),
          currentSessionEmail ? listAssignedDriverRideRequests(currentSessionEmail) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          const pending = pendingBatches.flat();
          const live = [...pending, ...assigned.filter((request) => request.matchId === match.id)];
          const deduped = live.filter((request, index, list) => list.findIndex((item) => item.id === request.id) === index);
          setDriverRequests(deduped);
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
  }, [match, isDriver, currentSessionEmail]);

  useEffect(() => {
    if (!currentSessionEmail) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const live = await listPassengerRideRequests(currentSessionEmail);
        if (cancelled) return;
        const activeRequest = live.find((request) => request.status !== 'COMPLETED' && request.status !== 'REFUSED') ?? live[0] ?? null;
        if (activeRequest) {
          setRideRequest(activeRequest);
          if (activeRequest.status === 'ACCEPTED') {
            setStatusMessage(`${activeRequest.driverDisplayName ?? 'Driver'} accepted your request and is on the way.`);
          } else if (activeRequest.status === 'ARRIVED_AT_PICKUP') {
            setStatusMessage(`${activeRequest.driverDisplayName ?? 'Driver'} arrived at the pickup point.`);
          } else if (activeRequest.status === 'IN_PROGRESS') {
            setStatusMessage(`${activeRequest.driverDisplayName ?? 'Driver'} is driving you to ${activeRequest.destinationLabel}.`);
          }
        }
      } catch {
        if (cancelled) return;
      }
    };
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 7000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [currentSessionEmail]);

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
      const wantsLiveBooking = provider.providerType.toLowerCase().includes('taxi') || provider.providerType.toLowerCase().includes('vtc');
      if (!wantsLiveBooking) {
        const walkingQuery = destinationLabelToQuery(match, selectedDestination || match.venue);
        setStatusMessage(`${provider.displayName} opens the walking route in maps.`);
        await Linking.openURL(googleMapsDirectionsUrl(walkingQuery));
        return;
      }
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
    } catch {
      setRequestError('The ride request could not be created. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const requestSummary = rideRequest
    ? `${rideRequest.providerType} · ${rideRequest.status} · ${rideRequest.pickupLabel} → ${rideRequest.destinationLabel}`
    : null;
  const visibleDriverRequests = driverRequests.filter((request) => request.status !== 'ACCEPTED' || request.driverProfileId === currentDriverEmail);
  const activeDriverRequest = visibleDriverRequests.find((request) => request.status === 'ACCEPTED' && request.driverProfileId === currentDriverEmail) ?? null;
  const activeDriverStatusMeta = rideStatusStyle(activeDriverRequest?.status);
  const activeDriverStatus = rideStatusCopy(activeDriverRequest?.status);
  const activeDriverRoute = buildRideRouteCoordinates(
    activeDriverRequest?.driverLatitude != null && activeDriverRequest?.driverLongitude != null
      ? { latitude: activeDriverRequest.driverLatitude, longitude: activeDriverRequest.driverLongitude }
      : null,
    activeDriverRequest?.pickupLatitude != null && activeDriverRequest?.pickupLongitude != null
      ? { latitude: activeDriverRequest.pickupLatitude, longitude: activeDriverRequest.pickupLongitude }
      : null,
    activeDriverRequest?.status === 'IN_PROGRESS' && activeDriverRequest.destinationLatitude != null && activeDriverRequest.destinationLongitude != null
      ? { latitude: activeDriverRequest.destinationLatitude, longitude: activeDriverRequest.destinationLongitude }
      : null,
  );
  const passengerStatusMeta = rideStatusStyle(rideRequest?.status);
  const passengerStatus = rideStatusCopy(rideRequest?.status);
  const passengerRoute = buildRideRouteCoordinates(
    rideRequest?.driverLatitude != null && rideRequest?.driverLongitude != null
      ? { latitude: rideRequest.driverLatitude, longitude: rideRequest.driverLongitude }
      : null,
    rideRequest?.pickupLatitude != null && rideRequest?.pickupLongitude != null
      ? { latitude: rideRequest.pickupLatitude, longitude: rideRequest.pickupLongitude }
      : null,
    rideRequest?.status === 'IN_PROGRESS' && rideRequest.destinationLatitude != null && rideRequest.destinationLongitude != null
      ? { latitude: rideRequest.destinationLatitude, longitude: rideRequest.destinationLongitude }
      : null,
  );

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

          <Card title={t(locale, 'common.passengerRequests')} subtitle={t(locale, 'common.driverRequestsSubtitle')}>
            {driverRequestsLoading ? (
              <Text style={styles.muted}>{t(locale, 'common.loading')}</Text>
            ) : visibleDriverRequests.length ? (
              <View style={styles.cardBody}>
                {activeDriverRequest ? (
                  <View style={styles.miniCard}>
                    <View style={styles.rowBetween}>
                      <View style={styles.rowLeft}>
                        <Text style={styles.cardTitle}>Live ride in progress</Text>
                        <Text style={styles.muted}>{activeDriverRequest.passengerName}</Text>
                      </View>
                      <Pill subtle>{activeDriverRequest.status}</Pill>
                    </View>
                    <Text style={styles.muted}>{activeDriverRequest.pickupLabel}</Text>
                    <Text style={styles.miniCardMeta}>{activeDriverRequest.destinationLabel}</Text>
                    <Text style={styles.helperText}>
                      {activeDriverRequest.driverDistanceKm != null || activeDriverRequest.driverEtaMinutes != null
                        ? `Passenger is ${activeDriverRequest.driverDistanceKm ?? '?'} km away · ETA ${activeDriverRequest.driverEtaMinutes ?? '?'} min`
                        : 'Passenger location is live and will update on the map.'}
                    </Text>
                    <View style={styles.ctaRow}>
                      <SecondaryButton label="Arrived at pickup" onPress={() => void markRideRequestArrived(activeDriverRequest.id)} icon={<Ionicons name="location-outline" size={16} color="#1d3fb3" />} />
                      <PrimaryButton label="Start trip" onPress={() => void startRideRequestTrip(activeDriverRequest.id)} icon={<Ionicons name="navigate-outline" size={16} color="#172033" />} />
                      <SecondaryButton label="Complete trip" onPress={() => void completeRideRequestTrip(activeDriverRequest.id)} icon={<Ionicons name="checkmark-done-outline" size={16} color="#1d3fb3" />} />
                    </View>
                  </View>
                ) : null}
                {visibleDriverRequests.map((request) => {
                  const isOwnAccepted = request.status === 'ACCEPTED' && request.driverProfileId === currentDriverEmail;
                  return (
                    <View key={request.id} style={styles.miniCard}>
                      <Text style={styles.miniCardTitle}>{request.passengerName}</Text>
                      <Text style={styles.muted}>{request.pickupLabel}</Text>
                      <Text style={styles.miniCardMeta}>{request.destinationLabel}</Text>
                      <Text style={styles.muted}>{request.status}</Text>
                      {isOwnAccepted ? (
                        <Text style={styles.helperText}>You accepted this request. Open the map to drive to the passenger, then mark arrival and start the trip.</Text>
                      ) : null}
                      <View style={styles.ctaRow}>
                        {request.status === 'PENDING' ? (
                          <>
                            <SecondaryButton
                              label={t(locale, 'common.refuse')}
                              onPress={() => {
                                void refuseRideRequest(request.id);
                              }}
                            />
                            <PrimaryButton
                              label={t(locale, 'common.accept')}
                              onPress={() => {
                                void acceptRideRequest(request.id).then((accepted) => {
                                  setDriverRequests((current) => current.map((item) => (item.id === accepted.id ? accepted : item)));
                                  setStatusMessage(
                                    `${accepted.passengerName} is waiting${accepted.driverDistanceKm != null ? ` · ${accepted.driverDistanceKm} km away` : ''}${accepted.driverEtaMinutes != null ? ` · ETA ${accepted.driverEtaMinutes} min` : ''}`,
                                  );
                                });
                              }}
                              icon={<Ionicons name="checkmark" size={16} color="#172033" />}
                            />
                          </>
                        ) : isOwnAccepted ? (
                          <SecondaryButton
                            label={t(locale, 'common.openInMaps')}
                            onPress={() => void openGoogleMapsDirections(destinationLabelToQuery(match, request.pickupLabel))}
                            icon={<Feather name="map" size={16} color="#1d3fb3" />}
                          />
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState icon="car-sport-outline" title={t(locale, 'common.noLiveReservation')} subtitle={t(locale, 'common.driverRequestsSubtitle')} />
            )}
          </Card>

          <View style={styles.card}>
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
                showsTraffic
                showsCompass={false}
              >
                <Marker coordinate={{ latitude: 40.4531, longitude: -3.6883 }} title={match.venue} description={`${match.city}, ${match.country}`} />
                {activeDriverRoute.length > 1 ? (
                  <>
                    <Polyline coordinates={activeDriverRoute} strokeColor="rgba(9, 17, 31, 0.42)" strokeWidth={9} geodesic lineCap="round" lineJoin="round" />
                    <Polyline coordinates={activeDriverRoute} strokeColor="#1d3fb3" strokeWidth={5} geodesic lineCap="round" lineJoin="round" />
                  </>
                ) : null}
                {activeDriverRequest?.driverLatitude != null && activeDriverRequest?.driverLongitude != null ? (
                  <Marker coordinate={{ latitude: activeDriverRequest.driverLatitude, longitude: activeDriverRequest.driverLongitude }} title={activeDriverRequest.driverDisplayName || 'Driver'} pinColor="#1d3fb3" />
                ) : null}
                {activeDriverRequest?.pickupLatitude != null && activeDriverRequest?.pickupLongitude != null ? (
                  <Marker coordinate={{ latitude: activeDriverRequest.pickupLatitude, longitude: activeDriverRequest.pickupLongitude }} title={activeDriverRequest.pickupLabel} pinColor="#c8f36a" />
                ) : null}
                {activeDriverRequest?.status === 'IN_PROGRESS' && activeDriverRequest.destinationLatitude != null && activeDriverRequest.destinationLongitude != null ? (
                  <Marker coordinate={{ latitude: activeDriverRequest.destinationLatitude, longitude: activeDriverRequest.destinationLongitude }} title={activeDriverRequest.destinationLabel} pinColor="#172033" />
                ) : null}
              </MapView>
              <View style={styles.mapOverlay}>
                <View style={styles.rowBetween}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.cardTitle}>{activeDriverStatus.title}</Text>
                    <Text style={styles.muted}>{activeDriverStatus.subtitle}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: activeDriverStatusMeta.backgroundColor }}>
                    <Text style={{ color: activeDriverStatusMeta.color, fontFamily: 'Poppins-SemiBold' }}>{activeDriverStatus.badge}</Text>
                  </View>
                </View>
                <Text style={styles.helperText}>{activeDriverStatus.detail}</Text>
                {activeDriverRequest ? (
                  <Text style={styles.helperText}>
                    {activeDriverRequest.passengerName} · {activeDriverRequest.pickupLabel} · {activeDriverRequest.destinationLabel}
                  </Text>
                ) : null}
                {activeDriverRequest?.driverDistanceKm != null || activeDriverRequest?.driverEtaMinutes != null ? (
                  <Text style={styles.helperText}>
                    {activeDriverRequest.driverDistanceKm != null ? `${activeDriverRequest.driverDistanceKm} km away` : 'Distance updating'} · {activeDriverRequest.driverEtaMinutes != null ? `${activeDriverRequest.driverEtaMinutes} min ETA` : 'ETA updating'}
                  </Text>
                ) : null}
              </View>
            </View>
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
              {passengerRoute.length > 1 ? (
                <>
                  <Polyline
                    coordinates={passengerRoute}
                    strokeColor="rgba(9, 17, 31, 0.42)"
                    strokeWidth={9}
                    geodesic
                    lineCap="round"
                    lineJoin="round"
                  />
                  <Polyline
                    coordinates={passengerRoute}
                    strokeColor={passengerStatusMeta.color}
                    strokeWidth={5}
                    geodesic
                    lineCap="round"
                    lineJoin="round"
                  />
                </>
              ) : null}
              {rideRequest?.pickupLatitude != null && rideRequest?.pickupLongitude != null ? (
                <Marker
                  coordinate={{ latitude: rideRequest.pickupLatitude, longitude: rideRequest.pickupLongitude }}
                  title="Passenger pickup"
                  description={rideRequest.pickupLabel}
                  pinColor="#c8f36a"
                />
              ) : null}
              {rideRequest?.driverLatitude != null && rideRequest?.driverLongitude != null ? (
                <Marker
                  coordinate={{ latitude: rideRequest.driverLatitude, longitude: rideRequest.driverLongitude }}
                  title={rideRequest.driverDisplayName || 'Driver'}
                  description={rideRequest.driverVehiclePlate || rideRequest.driverPhone || ''}
                  pinColor="#1d3fb3"
                />
              ) : null}
              {rideRequest?.status === 'IN_PROGRESS' && rideRequest.destinationLatitude != null && rideRequest.destinationLongitude != null ? (
                <Marker
                  coordinate={{ latitude: rideRequest.destinationLatitude, longitude: rideRequest.destinationLongitude }}
                  title={rideRequest.destinationLabel}
                  pinColor="#172033"
                />
              ) : null}
            </MapView>
            <View style={styles.mapOverlay}>
              <View style={styles.rowBetween}>
                <View style={styles.rowLeft}>
                  <Text style={styles.cardTitle}>{passengerStatus.title}</Text>
                  <Text style={styles.muted}>{passengerStatus.subtitle}</Text>
                </View>
                <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: passengerStatusMeta.backgroundColor }}>
                  <Text style={{ color: passengerStatusMeta.color, fontFamily: 'Poppins-SemiBold' }}>{passengerStatus.badge}</Text>
                </View>
              </View>
              <Text style={styles.helperText}>{passengerStatus.detail}</Text>
              <Text style={styles.helperText}>
                {rideRequest?.driverDisplayName || 'Your driver'}
                {rideRequest?.driverVehiclePlate ? ` · ${rideRequest.driverVehiclePlate}` : ''}
                {rideRequest?.driverDistanceKm != null ? ` · ${rideRequest.driverDistanceKm} km away` : ' · distance updating'}
                {rideRequest?.driverEtaMinutes != null ? ` · ${rideRequest.driverEtaMinutes} min ETA` : ' · ETA updating'}
              </Text>
              {rideRequest?.status === 'IN_PROGRESS' ? (
                <Text style={styles.helperText}>The trip route is now live on the map until the final destination.</Text>
              ) : null}
              {statusMessage ? <Text style={styles.helperText}>{statusMessage}</Text> : null}
              <View style={styles.ctaRow}>
                <SecondaryButton label={t(locale, 'common.openInMaps')} onPress={() => void openGoogleMapsDirections(mapQuery)} icon={<Feather name="map" size={16} color="#1d3fb3" />} />
              </View>
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
                    : rideRequest.status === 'ARRIVED_AT_PICKUP'
                      ? 'The driver has arrived at the pickup point.'
                      : rideRequest.status === 'IN_PROGRESS'
                        ? 'The driver is now taking you to the final destination.'
                        : 'The driver refused the request. Select another available chauffeur.'}
              </Text>
              {rideRequest.status === 'ACCEPTED' || rideRequest.status === 'ARRIVED_AT_PICKUP' || rideRequest.status === 'IN_PROGRESS' ? (
                <Text style={styles.helperText}>
                  {rideRequest.driverDisplayName || 'Driver'} · {rideRequest.driverVehiclePlate || 'plate pending'} · {rideRequest.driverDistanceKm != null ? `${rideRequest.driverDistanceKm} km away` : 'distance updating'} · {rideRequest.driverEtaMinutes != null ? `${rideRequest.driverEtaMinutes} min` : 'ETA updating'}
                </Text>
              ) : null}
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
