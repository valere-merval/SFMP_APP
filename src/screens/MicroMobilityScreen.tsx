import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapboxNaviView from '../components/MapboxNaviView';
import { requestCurrentCoordinates, type Coordinate } from '../location';
import type { LiveData, MobilityCard } from '../types';
import { Card, EmptyState, Pill, PrimaryButton, SecondaryButton, styles } from '../ui';
import { t, type Locale } from '../i18n';
import { fetchPedestrianRoute, openGoogleMapsDirections } from '../maps';
import { speakVoiceGuidance, stopVoiceGuidance, loadVoiceGuidanceEnabled } from '../voice';

type MicroMobilityScreenProps = {
  locale: Locale;
  data: LiveData | null;
  venueName?: string;
  city?: string;
  country?: string;
};

function mobilityLabel(locale: Locale, item: MobilityCard) {
  const normalized = item.mode.toLowerCase();
  if (normalized.includes('bike') || normalized.includes('bicycle')) {
    return { label: t(locale, 'journey.bikeLabel'), icon: 'bicycle' as const };
  }
  return { label: t(locale, 'journey.scooterLabel'), icon: 'scooter' as const };
}

const mobilityDestination = (item: MobilityCard) => {
  if (item.latitude != null && item.longitude != null) {
    return `${item.latitude},${item.longitude}`;
  }
  return item.stationAddress?.trim() || '';
};

const allMobilityLabel = (locale: Locale) => {
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

export function MicroMobilityScreen({ locale, data, venueName, city, country }: MicroMobilityScreenProps) {
  const mobility = useMemo(
    () => (data?.mobility ?? []).filter((item) => /scooter|bike|bicycle/i.test(item.mode)),
    [data],
  );
  const [filterMode, setFilterMode] = useState<'all' | 'bike' | 'scooter'>('all');
  const filteredMobility = useMemo(
    () =>
      mobility.filter((item) => {
        if (filterMode === 'bike') return /bike|bicycle/i.test(item.mode);
        if (filterMode === 'scooter') return /scooter/i.test(item.mode);
        return true;
      }),
    [filterMode, mobility],
  );
  const bikeCount = mobility.filter((item) => /bike|bicycle/i.test(item.mode)).length;
  const scooterCount = mobility.filter((item) => /scooter/i.test(item.mode)).length;
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [selectedId, setSelectedId] = useState(filteredMobility[0]?.id ?? '');
  const [pedestrianRoute, setPedestrianRoute] = useState<Coordinate[] | null>(null);
  const [routeDistanceMeters, setRouteDistanceMeters] = useState<number | null>(null);
  const [routeDurationSeconds, setRouteDurationSeconds] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const selected = filteredMobility.find((item) => item.id === selectedId) ?? filteredMobility[0] ?? null;
  const selectedDestination = selected
    ? selected.latitude != null && selected.longitude != null
      ? { latitude: selected.latitude, longitude: selected.longitude }
      : null
    : null;
  const mapTitle = venueName ?? ([city, country].filter(Boolean).join(', ') || t(locale, 'common.destination'));
  const mobilityMarkers = useMemo(
    () =>
      filteredMobility
        .filter((item): item is MobilityCard & { latitude: number; longitude: number } => item.latitude != null && item.longitude != null)
        .map((item) => ({
          id: item.id,
          coordinate: { latitude: item.latitude, longitude: item.longitude },
          icon: mobilityLabel(locale, item).icon,
          label: mobilityLabel(locale, item).label,
          accentColor: /scooter/i.test(item.mode) ? '#7c3aed' : '#22c55e',
          iconColor: '#f8fafc',
        })),
    [filteredMobility, locale],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const enabled = await loadVoiceGuidanceEnabled();
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
    let mounted = true;
    void requestCurrentCoordinates().then((coordinate) => {
      if (mounted) {
        setCurrentLocation(coordinate);
      }
    });

    let watchId: number | null = null;
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
    if (selected && selectedDestination && currentLocation && voiceGuidanceEnabled) {
      const km = routeDistanceMeters != null ? Math.max(0.1, routeDistanceMeters / 1000) : null;
      const minutes = routeDurationSeconds != null ? Math.max(1, Math.round(routeDurationSeconds / 60)) : null;
      const summary = km && minutes
        ? `${selected.mode}. Marche de ${km.toFixed(1)} kilomètres, environ ${minutes} minutes.`
        : `${selected.mode}. Navigation piétonne activée.`;
      speakVoiceGuidance(summary, locale);
    }
    return () => stopVoiceGuidance();
  }, [currentLocation, locale, routeDistanceMeters, routeDurationSeconds, selected, selectedDestination, voiceGuidanceEnabled]);

  useEffect(() => {
    if (!selected || !selectedDestination || !currentLocation) {
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
  }, [currentLocation, selected, selectedDestination]);

  useEffect(() => {
    if (!filteredMobility.length) {
      setSelectedId('');
      return;
    }
    if (!selectedId || !filteredMobility.some((item) => item.id === selectedId)) {
      setSelectedId(filteredMobility[0].id);
    }
  }, [filteredMobility, selectedId]);

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EmptyState icon="bicycle-outline" title={t(locale, 'common.loading')} subtitle={t(locale, 'common.loading')} />
        </View>
      </SafeAreaView>
    );
  }

  const selectedLabel = selected ? mobilityLabel(locale, selected) : null;
  const routeSummary = selected
    ? routeDistanceMeters != null && routeDurationSeconds != null
      ? `${(routeDistanceMeters / 1000).toFixed(1)} km · ${Math.max(1, Math.round(routeDurationSeconds / 60))} min`
      : t(locale, 'common.live')
    : t(locale, 'common.backendUnavailable');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{t(locale, 'nav.mobility')}</Text>
          <Text style={styles.title}>{t(locale, 'nav.mobility')}</Text>
          <Text style={styles.subtitle}>{mapTitle}</Text>
        </View>

        <View style={heroStyles.heroHeader}>
          <View style={heroStyles.heroTopRow}>
            <View style={heroStyles.heroBrandBlock}>
              <View style={heroStyles.heroBrandDot} />
              <View style={heroStyles.heroBrandText}>
                <Text style={heroStyles.heroKicker}>{t(locale, 'mobility.liveTitle')}</Text>
                <Text style={heroStyles.heroTitle}>{t(locale, 'mobility.scootersAndBikes')}</Text>
              </View>
            </View>
            <View style={heroStyles.livePill}>
              <View style={heroStyles.liveDot} />
              <Text style={heroStyles.liveText}>{t(locale, 'common.live')}</Text>
            </View>
          </View>
          <Text style={heroStyles.heroSubtitle} numberOfLines={2}>
            {selected ? `${selectedLabel?.label ?? selected.mode} · ${selected.duration} · ${selected.price}` : t(locale, 'common.available')}
          </Text>
          <View style={heroStyles.heroChips}>
            <View style={heroStyles.heroChip}><Text style={heroStyles.heroChipText}>{venueName ?? t(locale, 'common.destination')}</Text></View>
            <View style={heroStyles.heroChip}><Text style={heroStyles.heroChipText}>{selected?.badge ?? t(locale, 'common.backendUnavailable')}</Text></View>
            <View style={heroStyles.heroChip}><Text style={heroStyles.heroChipText}>{bikeCount} bikes</Text></View>
            <View style={heroStyles.heroChip}><Text style={heroStyles.heroChipText}>{scooterCount} scooters</Text></View>
          </View>
        </View>

        <View style={heroStyles.filterRow}>
          {([
            { key: 'all', label: allMobilityLabel(locale), icon: 'dots-horizontal' },
            { key: 'bike', label: t(locale, 'journey.bikeLabel'), icon: 'bike' },
            { key: 'scooter', label: t(locale, 'journey.scooterLabel'), icon: 'scooter' },
          ] as const).map((item) => {
            const active = filterMode === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilterMode(item.key)}
                style={[heroStyles.filterChip, active && heroStyles.filterChipActive]}
              >
                <MaterialCommunityIcons name={item.icon as never} size={16} color={active ? '#09111f' : '#c8f36a'} />
                <Text style={[heroStyles.filterChipText, active && heroStyles.filterChipTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Card title={t(locale, 'common.liveMap')} subtitle={t(locale, 'common.pickupTracking')} wide>
          {selected ? (
            <View style={heroStyles.navigationSummary}>
              <Text style={heroStyles.navigationSummaryTitle}>
                {routeLoading ? 'Navigation piétonne en cours' : 'Navigation piétonne prête'}
              </Text>
              <Text style={heroStyles.navigationSummaryBody}>
                {selectedLabel?.label ?? selected.mode} · {routeSummary}
              </Text>
            </View>
          ) : null}
          <MapboxNaviView
            height={390}
            origin={currentLocation}
            destination={selectedDestination ?? currentLocation ?? undefined}
            route={pedestrianRoute ?? undefined}
            markers={[
              ...(currentLocation
                ? [{ id: 'you', coordinate: currentLocation, icon: 'walk', label: 'Vous', accentColor: '#4ade80', iconColor: '#09111f' }]
                : []),
              ...(selectedDestination && selected
                ? [{ id: `mobility-${selected.id}`, coordinate: selectedDestination, icon: selected.mode.toLowerCase().includes('scooter') ? 'scooter' : 'bicycle', label: selectedLabel?.label ?? selected.mode, accentColor: selected.mode.toLowerCase().includes('scooter') ? '#c8f36a' : '#22d3ee', iconColor: '#09111f' }]
                : []),
            ]}
            title={selectedLabel?.label ?? mapTitle}
            subtitle={selected ? `${selected.mode}${selected.stationAddress ? ` · ${selected.stationAddress}` : ''}` : mapTitle}
            liveLabel={selected ? `${selected.duration} · ${selected.price}` : t(locale, 'common.backendUnavailable')}
          />
          <View style={styles.ctaRow}>
            <PrimaryButton
              label={t(locale, 'common.navigate')}
              onPress={() => {
                if (selected) {
                  void openGoogleMapsDirections(mobilityDestination(selected) || mapTitle);
                }
              }}
              icon={<Ionicons name="walk-outline" size={16} color="#f8fafc" />}
            />
            <SecondaryButton
              label={t(locale, 'common.openInGoogleMaps')}
              onPress={() => {
                if (selected) {
                  void openGoogleMapsDirections(mobilityDestination(selected) || mapTitle);
                }
              }}
              icon={<Ionicons name="map-outline" size={16} color="#22d3ee" />}
            />
          </View>
          {selected ? (
            <View style={heroStyles.detailRow}>
              <View style={heroStyles.detailCard}>
                <Text style={heroStyles.detailLabel}>{t(locale, 'mobility.mode')}</Text>
                <Text style={heroStyles.detailValue}>{selected.mode}</Text>
              </View>
              <View style={heroStyles.detailCard}>
                <Text style={heroStyles.detailLabel}>{t(locale, 'mobility.eta')}</Text>
                <Text style={heroStyles.detailValue}>{selected.duration}</Text>
              </View>
              <View style={heroStyles.detailCard}>
                <Text style={heroStyles.detailLabel}>{t(locale, 'mobility.price')}</Text>
                <Text style={heroStyles.detailValue}>{selected.price}</Text>
              </View>
            </View>
          ) : null}
        </Card>

        <Card title={t(locale, 'common.available')} subtitle={t(locale, 'common.liveTracking')} wide>
          {filteredMobility.length ? (
            <View style={mobilityList.listGap}>
              {filteredMobility.map((item) => {
                const isSelected = item.id === selected?.id;
                const label = mobilityLabel(locale, item);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedId(item.id)}
                    style={[styles.miniCard, isSelected && mobilityList.selectedCard]}
                  >
                    <View style={styles.rowBetween}>
                      <View style={styles.rowLeft}>
                        <View style={styles.buttonContent}>
                          <View style={[styles.buttonIcon, item.mode.toLowerCase().includes('scooter') ? mobilityList.scooterIcon : mobilityList.bikeIcon]}>
                            <MaterialCommunityIcons name={label.icon} size={18} color="#f8fafc" />
                          </View>
                          <View style={mobilityList.metaColumn}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{label.label}</Text>
                            <Text style={styles.muted} numberOfLines={1}>{item.mode}</Text>
                          </View>
                        </View>
                      </View>
                      <Pill subtle>{item.badge}</Pill>
                    </View>
                    <View style={mobilityList.metaRow}>
                      <View style={mobilityList.metaChip}>
                        <Text style={mobilityList.metaChipText}>{item.duration}</Text>
                      </View>
                      <View style={mobilityList.metaChipSoft}>
                        <Text style={mobilityList.metaChipText}>{item.price}</Text>
                      </View>
                      {item.stationAddress ? (
                        <View style={mobilityList.metaChipGhost}>
                          <Text style={mobilityList.metaChipText} numberOfLines={1}>{item.stationAddress}</Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyState icon="bicycle-outline" title={t(locale, 'common.noProviders')} subtitle={t(locale, 'common.backendUnavailable')} />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const mobilityList = StyleSheet.create({
  listGap: { gap: 12 },
  selectedCard: {
    borderColor: '#c8f36a',
    borderWidth: 1.5,
    backgroundColor: '#0d1627',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  metaColumn: { gap: 2, minWidth: 0 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(157, 245, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(157, 245, 255, 0.12)',
  },
  metaChipSoft: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 243, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.12)',
  },
  metaChipGhost: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    maxWidth: '100%',
  },
  metaChipText: { color: '#f8fbff', fontFamily: 'Poppins-Medium', fontSize: 11 },
  bikeIcon: { backgroundColor: 'rgba(157, 245, 255, 0.16)' },
  scooterIcon: { backgroundColor: 'rgba(201, 243, 106, 0.16)' },
});

const heroStyles = StyleSheet.create({
  heroHeader: {
    gap: 12,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroBrandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  heroBrandDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#c8f36a',
    shadowColor: '#c8f36a',
    shadowOpacity: 0.55,
    shadowRadius: 8,
  },
  heroBrandText: { flex: 1, minWidth: 0, gap: 2 },
  heroKicker: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    lineHeight: 22,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(11, 18, 32, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.16)',
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c8f36a' },
  liveText: {
    color: '#c8f36a',
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  heroSubtitle: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  heroChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  heroChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(157, 245, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(157, 245, 255, 0.14)',
  },
  heroChipText: { color: '#9df5ff', fontFamily: 'Poppins-SemiBold', fontSize: 11 },
  navigationSummary: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.16)',
    gap: 4,
  },
  navigationSummaryTitle: {
    color: '#f8fbff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
  navigationSummaryBody: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
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
  detailRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  detailCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 88,
    backgroundColor: '#0b1220',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  detailLabel: {
    color: '#9fb2cb',
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default MicroMobilityScreen;
