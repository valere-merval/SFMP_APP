import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapboxNaviView from '../components/MapboxNaviView';
import { requestCurrentCoordinates, type Coordinate } from '../location';
import { loadTransportAvailability, loadTransportProfile, saveTransportAvailability, listTransportProviders, type TransportAvailabilityView, type TransportProfileView } from '../api';
import { type LiveData, type TransportProviderView } from '../types';
import { Card, EmptyState, PrimaryButton, SecondaryButton, styles as uiStyles } from '../ui';
import { t, type Locale } from '../i18n';
import { fetchPedestrianRoute, openGoogleMapsDirections } from '../maps';
import { speakVoiceGuidance, stopVoiceGuidance } from '../voice';

type TransitFilter = 'all' | 'train' | 'tram' | 'metro' | 'bus';

const transitModes: Array<{ value: TransitFilter; labelKey?: string; icon: string }> = [
  { value: 'all', icon: 'dots-horizontal-circle-outline' },
  { value: 'train', labelKey: 'journey.trainLabel', icon: 'train' },
  { value: 'tram', labelKey: 'journey.tramLabel', icon: 'tram' },
  { value: 'metro', labelKey: 'journey.metroLabel', icon: 'subway' },
  { value: 'bus', labelKey: 'journey.busLabel', icon: 'bus' },
];

const modeLabel = (locale: Locale, providerType: string) => {
  const value = providerType.trim().toLowerCase();
  if (value.includes('bus')) return t(locale, 'journey.busLabel');
  if (value.includes('train')) return t(locale, 'journey.trainLabel');
  if (value.includes('tram')) return t(locale, 'journey.tramLabel');
  if (value.includes('metro') || value.includes('subway')) return t(locale, 'journey.metroLabel');
  return providerType;
};

const providerDestination = (provider: TransportProviderView) => {
  if (provider.stationLatitude != null && provider.stationLongitude != null) {
    return { latitude: provider.stationLatitude, longitude: provider.stationLongitude };
  }
  return null;
};

const providerMapLabel = (provider: TransportProviderView) =>
  provider.stationAddress?.trim() || `${provider.city}, ${provider.country}`;

const formatWalkingDistance = (meters: number | null) => {
  if (meters == null) return 'Distance en direct';
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

const formatWalkingDuration = (seconds: number | null) => {
  if (seconds == null) return 'Temps en direct';
  return `${Math.max(1, Math.round(seconds / 60))} min`;
};

const isTransitProvider = (providerType: string) => /train|tram|metro|subway|bus/i.test(providerType);

const transitIcon = (providerType: string) => {
  const value = providerType.toLowerCase();
  if (value.includes('train')) return 'train';
  if (value.includes('tram')) return 'tram';
  if (value.includes('metro') || value.includes('subway')) return 'subway';
  return 'bus';
};

const allModesLabel = (locale: Locale) => {
  switch (locale) {
    case 'fr':
      return 'Tous';
    case 'es':
      return 'Todos';
    case 'de':
      return 'Alle';
    case 'pt':
      return 'Todos';
    case 'ar':
      return 'الكل';
    case 'zh':
      return '全部';
    case 'ru':
      return 'Все';
    default:
      return 'All';
  }
};

export function TransportScreen({
  locale,
  data,
  loading,
  onReload,
  initialMatchId,
}: {
  locale: Locale;
  data: LiveData | null;
  loading: boolean;
  onReload: () => Promise<void> | void;
  initialMatchId?: string | null;
}) {
  const matches = useMemo(() => data?.matches ?? [], [data?.matches]);
  const baseProviders = useMemo(() => data?.transportProviders ?? [], [data?.transportProviders]);
  const [publicProviders, setPublicProviders] = useState<TransportProviderView[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [matchId, setMatchId] = useState(() => initialMatchId ?? '');
  const [activeFilter, setActiveFilter] = useState<TransitFilter>('all');
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedAvailability, setLoadedAvailability] = useState<TransportAvailabilityView | null>(null);
  const [myProfile, setMyProfile] = useState<TransportProfileView | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const registeredDriver = !!myProfile?.id;
  const selectedMatch = useMemo(() => matches.find((item) => item.id === matchId) ?? null, [matchId, matches]);
  const providers = useMemo(() => {
    const merged = [...baseProviders, ...publicProviders];
    const seen = new Set<string>();
    return merged.filter((provider) => {
      const key = `${provider.id}:${provider.matchId}:${provider.providerType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [baseProviders, publicProviders]);
  const visibleProviders = useMemo(
    () => providers.filter((provider) => !matchId || provider.matchId === matchId),
    [matchId, providers],
  );
  const transitProviders = useMemo(
    () => visibleProviders.filter((provider) => isTransitProvider(provider.providerType)),
    [visibleProviders],
  );
  const providersToShow = useMemo(
    () => transitProviders.filter((provider) => activeFilter === 'all' || provider.providerType.toLowerCase().includes(activeFilter)),
    [activeFilter, transitProviders],
  );
  const trainCount = transitProviders.filter((provider) => /train/i.test(provider.providerType)).length;
  const tramCount = transitProviders.filter((provider) => /tram|streetcar|light rail/i.test(provider.providerType)).length;
  const metroCount = transitProviders.filter((provider) => /metro|subway/i.test(provider.providerType)).length;
  const busCount = transitProviders.filter((provider) => /bus/i.test(provider.providerType)).length;
  const selectedProvider = useMemo(
    () => providersToShow.find((provider) => provider.id === selectedProviderId) ?? providersToShow[0] ?? null,
    [providersToShow, selectedProviderId],
  );
  const selectedDestination = selectedProvider ? providerDestination(selectedProvider) : null;
  const [pedestrianRoute, setPedestrianRoute] = useState<Coordinate[] | null>(null);
  const [routeDistanceMeters, setRouteDistanceMeters] = useState<number | null>(null);
  const [routeDurationSeconds, setRouteDurationSeconds] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const enabled = await import('../voice').then((module) => module.loadVoiceGuidanceEnabled());
        if (mounted) {
          setVoiceGuidanceEnabled(enabled);
        }
      } catch {
        if (mounted) {
          setVoiceGuidanceEnabled(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedProvider && selectedDestination && currentLocation && voiceGuidanceEnabled) {
      const distanceKm = routeDistanceMeters != null ? Math.max(0.1, routeDistanceMeters / 1000) : null;
      const minutes = routeDurationSeconds != null ? Math.max(1, Math.round(routeDurationSeconds / 60)) : null;
      const walkSummary = distanceKm && minutes
        ? `${selectedProvider.displayName}. Marche piétonne de ${distanceKm.toFixed(1)} kilomètres, environ ${minutes} minutes.`
        : `${selectedProvider.displayName}. Navigation piétonne activée.`;
      speakVoiceGuidance(walkSummary, locale);
    }
    return () => stopVoiceGuidance();
  }, [currentLocation, locale, routeDistanceMeters, routeDurationSeconds, selectedDestination, selectedProvider, voiceGuidanceEnabled]);

  useEffect(() => {
    if (!selectedProvider || !selectedDestination || !currentLocation) {
      setPedestrianRoute(null);
      setRouteDistanceMeters(null);
      setRouteDurationSeconds(null);
      return;
    }

    let mounted = true;
    setRouteLoading(true);
    (async () => {
      try {
        const route = await fetchPedestrianRoute(currentLocation, selectedDestination);
        if (!mounted) return;
        if (route) {
          setPedestrianRoute(route.coordinates);
          setRouteDistanceMeters(route.distanceMeters);
          setRouteDurationSeconds(route.durationSeconds);
        } else {
          setPedestrianRoute([currentLocation, selectedDestination]);
          setRouteDistanceMeters(null);
          setRouteDurationSeconds(null);
        }
      } catch {
        if (!mounted) return;
        setPedestrianRoute([currentLocation, selectedDestination]);
        setRouteDistanceMeters(null);
        setRouteDurationSeconds(null);
      } finally {
        if (mounted) setRouteLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [currentLocation, selectedDestination, selectedProvider]);

  useEffect(() => {
    let watchId: number | null = null;
    let mounted = true;

    void requestCurrentCoordinates().then((coords) => {
      if (mounted) {
        setCurrentLocation(coords);
      }
    });

    try {
      const Geolocation = require('react-native-geolocation-service').default;
      watchId = Geolocation.watchPosition(
        (position: { coords?: { latitude?: number; longitude?: number } }) => {
          const latitude = position.coords?.latitude;
          const longitude = position.coords?.longitude;
          if (typeof latitude === 'number' && typeof longitude === 'number') {
            setCurrentLocation({ latitude, longitude });
          }
        },
        () => undefined,
        {
          enableHighAccuracy: true,
          distanceFilter: 15,
          interval: 8000,
          fastestInterval: 4000,
          showsBackgroundLocationIndicator: false,
        },
      );
    } catch {
      watchId = null;
    }

    return () => {
      mounted = false;
      if (watchId != null) {
        try {
          const Geolocation = require('react-native-geolocation-service').default;
          Geolocation.clearWatch(watchId);
        } catch {
          // noop
        }
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await loadTransportProfile();
        if (!mounted) return;
        setMyProfile(profile);
      } catch {
        if (!mounted) return;
        setMyProfile(null);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);


  useEffect(() => {
    if (!matches.length) return;
    if (matchId && matches.some((item) => item.id === matchId)) return;
    if (initialMatchId && matches.some((item) => item.id === initialMatchId)) {
      setMatchId(initialMatchId);
      return;
    }
    setMatchId(matches[0].id);
  }, [initialMatchId, matchId, matches]);

  useEffect(() => {
    let mounted = true;
    if (!matchId) return;
    (async () => {
      try {
        const availability = await loadTransportAvailability(matchId);
        if (!mounted) return;
        setLoadedAvailability(availability);
        setAvailable(availability.available);
      } catch {
        if (!mounted) return;
        setLoadedAvailability(null);
        setAvailable(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [matchId]);

  useEffect(() => {
    let mounted = true;
    setProvidersLoading(true);
    (async () => {
      try {
        const live = await listTransportProviders(matchId || undefined);
        if (!mounted) return;
        setPublicProviders(live);
      } catch {
        if (!mounted) return;
        setPublicProviders([]);
      } finally {
        if (mounted) setProvidersLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [matchId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const coords = await requestCurrentCoordinates();
        if (!mounted) return;
        setCurrentLocation(coords);
      } catch {
        if (!mounted) return;
        setCurrentLocation(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!providersToShow.length) {
      setSelectedProviderId('');
      return;
    }
    if (!selectedProviderId || !providersToShow.some((provider) => provider.id === selectedProviderId)) {
      setSelectedProviderId(providersToShow[0].id);
    }
  }, [providersToShow, selectedProviderId]);

  const submit = async () => {
    if (!registeredDriver) {
      setError('Crée d’abord ton profil chauffeur dans Profil.');
      return;
    }
    if (!matchId) {
      setError('Choisis d’abord un match pour déclarer ta disponibilité.');
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveTransportAvailability(matchId, { available });
      setMessage(available ? 'Tu es maintenant visible comme disponible.' : 'Tu es maintenant masqué comme non disponible.');
      await onReload();
    } catch (caught: any) {
      setError(caught?.message ?? 'Impossible d’enregistrer la disponibilité.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={screenStyles.screen}>
      <ScrollView contentContainerStyle={screenStyles.container} showsVerticalScrollIndicator={false}>
        <View style={screenStyles.hero}>
          <Text style={screenStyles.kicker}>TRANSPORT LIVE</Text>
          <Text style={screenStyles.title}>Disponibilité chauffeur</Text>
          <Text style={screenStyles.subtitle}>
            Ton profil chauffeur se gère dans le profil utilisateur. Ici tu bascules seulement entre disponible ou pas disponible pour le match choisi.
          </Text>
          <View style={uiStyles.statsRow}>
            <View style={uiStyles.statBox}>
              <Text style={uiStyles.statLabel}>Lignes</Text>
              <Text style={uiStyles.statValue}>{transitProviders.length}</Text>
            </View>
            <View style={uiStyles.statBox}>
              <Text style={uiStyles.statLabel}>Train / Tram</Text>
              <Text style={uiStyles.statValue}>{trainCount + tramCount}</Text>
            </View>
            <View style={uiStyles.statBox}>
              <Text style={uiStyles.statLabel}>Bus / Metro</Text>
              <Text style={uiStyles.statValue}>{busCount + metroCount}</Text>
            </View>
          </View>
        </View>

        <Card title="Match ciblé" subtitle="Choisis l’événement" wide>
          {matches.length ? (
            <View style={uiStyles.chipsRow}>
              {matches.map((match) => (
                <Pressable key={match.id} onPress={() => setMatchId(match.id)} style={[uiStyles.tabChip, matchId === match.id && uiStyles.tabChipActive]}>
                  <Text style={[uiStyles.tabChipText, matchId === match.id && uiStyles.tabChipTextActive]}>{match.homeTeam} vs {match.awayTeam}</Text>
                </Pressable>
              ))}
            </View>
          ) : loading ? (
            <EmptyState icon="loader-outline" title="Chargement du catalogue" subtitle="Les matchs sont en cours de chargement." />
          ) : (
            <EmptyState icon="calendar-outline" title="Aucun match disponible" subtitle="Recharge le catalogue backend." />
          )}
          {selectedMatch ? <Text style={uiStyles.helperText}>Sélection active: {selectedMatch.homeTeam} vs {selectedMatch.awayTeam} · {selectedMatch.city}</Text> : null}
        </Card>

        <Card title="Mon statut" subtitle="Uniquement pour les chauffeurs enregistrés" wide>
          {!registeredDriver ? (
            <EmptyState icon="person-outline" title="Pas encore chauffeur" subtitle="Va dans Profil pour créer ou modifier ton enregistrement chauffeur." />
          ) : (
            <View style={screenStyles.rowGap}>
              {loadingProfile ? <EmptyState icon="time-outline" title="Chargement du profil chauffeur" subtitle="Lecture de ton profil en cours." /> : null}
              <View style={screenStyles.driverSummary}>
                <Text style={screenStyles.driverSummaryTitle}>{myProfile?.displayName || 'Profil chauffeur'}</Text>
                <Text style={screenStyles.driverSummaryBody}>{myProfile?.driverName} · {myProfile?.vehicleLabel}</Text>
                <Text style={screenStyles.driverSummaryBody}>{myProfile?.vehiclePlate} · {myProfile?.city}, {myProfile?.country}</Text>
              </View>
              <Pressable
                onPress={() => setAvailable((value) => !value)}
                style={[screenStyles.availabilityButton, available ? screenStyles.availabilityButtonOn : screenStyles.availabilityButtonOff]}
              >
                <Feather name={available ? 'check-circle' : 'slash'} size={28} color={available ? '#f8fafc' : '#09111f'} />
                <View style={screenStyles.availabilityButtonTextBlock}>
                  <Text style={[screenStyles.availabilityButtonTitle, !available && screenStyles.availabilityButtonTitleOff]}>
                    {available ? t(locale, 'common.available') : t(locale, 'common.notAvailable')}
                  </Text>
                  <Text style={[screenStyles.availabilityButtonSubtitle, !available && screenStyles.availabilityButtonSubtitleOff]}>
                    {t(locale, 'transport.driverAvailabilityHint')}
                  </Text>
                </View>
              </Pressable>
              <PrimaryButton
                label={saving ? 'Enregistrement...' : 'Sauver mon statut'}
                onPress={submit}
                icon={saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />}
              />
              <SecondaryButton label="Rafraîchir" onPress={onReload} icon={<Feather name="refresh-cw" size={16} color="#f8fafc" />} />
              {message ? <Text style={screenStyles.success}>{message}</Text> : null}
              {error ? <Text style={screenStyles.error}>{error}</Text> : null}
              {loadedAvailability ? <Text style={uiStyles.helperText}>Dernier état: {loadedAvailability.available ? 'Disponible' : 'Pas disponible'}</Text> : null}
            </View>
          )}
        </Card>

        <Card title="Résumé disponibilité" subtitle="Comptage live par mode" wide>
          <View style={screenStyles.summaryRow}>
            <SummaryPill label="Train" value={trainCount} active={trainCount > 0} />
            <SummaryPill label="Tram" value={tramCount} active={tramCount > 0} />
            <SummaryPill label="Bus" value={busCount} active={busCount > 0} />
            <SummaryPill label="Metro" value={metroCount} active={metroCount > 0} />
          </View>
          <Text style={uiStyles.helperText}>
            La liste ci-dessous s’aligne sur le match choisi et le filtre actif. Clique une ligne pour lancer le trajet piéton vers la station.
          </Text>
        </Card>

        <Card title="MATCH ROUTE" subtitle="Lignes directes du match sélectionné" wide>
          <View style={screenStyles.filterRow}>
            {transitModes.map((mode) => {
              const active = activeFilter === mode.value;
              const label = mode.value === 'all' ? allModesLabel(locale) : t(locale, mode.labelKey!);
              return (
                <Pressable
                  key={mode.value}
                  onPress={() => setActiveFilter(mode.value)}
                  style={[screenStyles.filterChip, active && screenStyles.filterChipActive]}
                >
                  <MaterialCommunityIcons
                    name={mode.icon as never}
                    size={16}
                    color={active ? '#09111f' : '#c8f36a'}
                  />
                  <Text style={[screenStyles.filterChipText, active && screenStyles.filterChipTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          {providersLoading ? (
            <EmptyState icon="loader-outline" title="Chargement des lignes" subtitle="Lecture de la disponibilité live pour ce match." />
          ) : providersToShow.length ? (
            <View style={screenStyles.rowGap}>
              <View style={screenStyles.listGap}>
                {providersToShow.map((provider: TransportProviderView) => {
                  const destination = providerDestination(provider);
                  const active = provider.id === selectedProvider?.id;
                  return (
                    <Pressable
                      key={provider.id}
                      onPress={() => {
                        setSelectedProviderId(provider.id);
                      }}
                      style={[screenStyles.providerCard, active && screenStyles.providerCardSelected]}
                    >
                      <View style={screenStyles.providerTop}>
                        <View style={screenStyles.providerBadge}>
                          <MaterialCommunityIcons name={transitIcon(provider.providerType) as never} size={16} color="#f8fafc" />
                          <Text style={screenStyles.providerBadgeText}>{modeLabel(locale, provider.providerType)}</Text>
                        </View>
                        <Text style={screenStyles.providerStatus}>{provider.active || provider.ready ? 'Disponible' : 'Pas disponible'}</Text>
                      </View>
                      <Text style={screenStyles.providerTitle}>{provider.displayName}</Text>
                      <Text style={screenStyles.providerBody}>{provider.driverName} · {provider.vehicleLabel}</Text>
                      <View style={screenStyles.providerMetaRow}>
                        <View style={screenStyles.providerMetaChip}>
                          <Text style={screenStyles.providerMetaText}>{provider.city}, {provider.country}</Text>
                        </View>
                        {provider.stationAddress ? (
                          <View style={screenStyles.providerMetaChipSoft}>
                            <Text style={screenStyles.providerMetaText}>{provider.stationAddress}</Text>
                          </View>
                        ) : null}
                      </View>
                      {provider.publicNotes ? <Text style={screenStyles.providerNotes}>{provider.publicNotes}</Text> : null}
                      <Pressable
                        onPress={() => {
                          if (destination) {
                            void openGoogleMapsDirections(`${destination.latitude},${destination.longitude}`);
                          }
                        }}
                        style={screenStyles.stationButton}
                      >
                        <Text style={screenStyles.stationButtonText}>{t(locale, 'common.navigate')}</Text>
                      </Pressable>
                    </Pressable>
                  );
                })}
              </View>

              {selectedProvider ? (
                <View style={screenStyles.navigationSummary}>
                  <Text style={screenStyles.navigationSummaryTitle}>
                    {routeLoading ? 'Navigation piétonne en cours' : 'Navigation piétonne prête'}
                  </Text>
                  <Text style={screenStyles.navigationSummaryBody}>
                    {providerMapLabel(selectedProvider)} · {formatWalkingDistance(routeDistanceMeters)} · {formatWalkingDuration(routeDurationSeconds)}
                  </Text>
                </View>
              ) : null}
              <MapboxNaviView
                origin={currentLocation}
                destination={selectedDestination}
                route={pedestrianRoute ?? undefined}
                markers={[
                  ...(currentLocation
                    ? [{ id: 'you', coordinate: currentLocation, icon: 'walk', label: 'Vous', accentColor: '#4ade80', iconColor: '#09111f' }]
                    : []),
                  ...(selectedDestination && selectedProvider
                    ? [{
                        id: `dest-${selectedProvider.id}`,
                        coordinate: selectedDestination,
                        icon: transitIcon(selectedProvider.providerType),
                        label: providerMapLabel(selectedProvider),
                        accentColor: '#c8f36a',
                        iconColor: '#09111f',
                      }]
                    : []),
                ]}
                height={290}
                title={selectedProvider ? selectedProvider.displayName : 'Ligne sélectionnée'}
                subtitle={selectedProvider ? `${modeLabel(locale, selectedProvider.providerType)} · ${providerMapLabel(selectedProvider)}` : 'Sélectionne une ligne pour activer la navigation'}
                liveLabel={selectedMatch ? `${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}` : 'Transit'}
                compactChrome={false}
              />
            </View>
          ) : (
            <EmptyState icon="car-outline" title="Aucune ligne visible" subtitle="Les lignes disponibles apparaîtront ici dès que le catalogue est chargé." />
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

function SummaryPill({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <View style={[screenStyles.summaryPill, active && screenStyles.summaryPillActive]}>
      <Text style={screenStyles.summaryLabel}>{label}</Text>
      <Text style={screenStyles.summaryValue}>{value}</Text>
    </View>
  );
}

const screenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#070d18' },
  container: { gap: 14, backgroundColor: '#070d18', paddingBottom: 28 },
  hero: { backgroundColor: '#c8f36a', padding: 20, gap: 10 },
  kicker: {
    color: '#09111f',
    letterSpacing: 1.2,
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  title: {
    color: '#09111f',
    fontSize: 30,
    lineHeight: 36,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    color: '#020B2D',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  rowGap: { gap: 12 },
  listGap: { gap: 12 },
  navigationSummary: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200, 243, 106, 0.25)',
    backgroundColor: '#0b1220',
    padding: 14,
    gap: 4,
  },
  navigationSummaryTitle: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  navigationSummaryBody: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  driverSummary: {
    backgroundColor: '#0b1220',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    gap: 4,
  },
  driverSummaryTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  driverSummaryBody: { color: '#9fb2cb', fontFamily: 'Poppins-Regular' },
  availabilityButton: {
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    width: '100%',
    minHeight: 112,
  },
  availabilityButtonOn: {
    backgroundColor: '#06B6D4',
    borderColor: '#06B6D4',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  availabilityButtonOff: {
    backgroundColor: '#f8fafc',
    borderColor: '#101827',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  availabilityButtonTextBlock: { flex: 1, gap: 4 },
  availabilityButtonTitle: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
  },
  availabilityButtonTitleOff: { color: '#09111f' },
  availabilityButtonSubtitle: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  availabilityButtonSubtitleOff: { color: '#334155' },
  success: { color: '#14532d', fontFamily: 'Poppins-Medium' },
  error: { color: '#b42318', fontFamily: 'Poppins-Medium' },
  providerCard: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.18)',
    backgroundColor: '#0b1220',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  providerCardSelected: {
    borderColor: '#c8f36a',
    shadowOpacity: 0.28,
    transform: [{ scale: 1.01 }],
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.18)',
    backgroundColor: 'rgba(11, 18, 32, 0.9)',
  },
  filterChipActive: {
    backgroundColor: '#c8f36a',
    borderColor: '#c8f36a',
  },
  filterChipText: {
    color: '#c8f36a',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#09111f',
  },
  providerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#94A3B8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  providerBadgeText: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
  providerStatus: { color: '#c8f36a', fontFamily: 'Oswald-SemiBold' },
  providerTitle: { color: '#f8fafc', fontFamily: 'Poppins-Bold', fontSize: 16 },
  providerBody: { color: '#9fb2cb', fontFamily: 'Poppins-Regular' },
  providerMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerMetaChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
  },
  providerMetaChipSoft: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 243, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.12)',
  },
  providerMetaText: { color: '#effbff', fontFamily: 'Poppins-Medium', fontSize: 11 },
  providerNotes: { color: '#f8fafc', fontFamily: 'Poppins-Medium', backgroundColor: 'rgba(148,163,184,0.08)', padding: 12, borderRadius: 14 },
  stationButton: {
    marginTop: 2,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#c8f36a',
  },
  stationButtonText: { color: '#09111f', fontFamily: 'Poppins-Bold', fontSize: 12 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryPill: {
    minWidth: 78,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
  },
  summaryPillActive: { backgroundColor: '#06B6D4', borderColor: '#94A3B8' },
  summaryLabel: {
    color: '#9fb2cb',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  summaryValue: { color: '#f8fafc', fontSize: 18, fontFamily: 'Poppins-Bold' },
});
