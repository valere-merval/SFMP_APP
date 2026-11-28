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
import { openGoogleMapsDirections } from '../maps';

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

export function MicroMobilityScreen({ locale, data, venueName, city, country }: MicroMobilityScreenProps) {
  const mobility = useMemo(
    () => (data?.mobility ?? []).filter((item) => /scooter|bike|bicycle/i.test(item.mode)),
    [data],
  );
  const bikeCount = mobility.filter((item) => /bike|bicycle/i.test(item.mode)).length;
  const scooterCount = mobility.filter((item) => /scooter/i.test(item.mode)).length;
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [selectedId, setSelectedId] = useState(mobility[0]?.id ?? '');
  const selected = mobility.find((item) => item.id === selectedId) ?? mobility[0] ?? null;
  const mapTitle = venueName ?? ([city, country].filter(Boolean).join(', ') || t(locale, 'common.destination'));

  useEffect(() => {
    let mounted = true;
    void requestCurrentCoordinates().then((coordinate) => {
      if (mounted) {
        setCurrentLocation(coordinate);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

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

        <Card title={t(locale, 'common.liveMap')} subtitle={t(locale, 'common.pickupTracking')} wide>
          <MapboxNaviView
            height={390}
            origin={currentLocation}
            destination={
              selected?.latitude != null && selected.longitude != null
                ? { latitude: selected.latitude, longitude: selected.longitude }
                : currentLocation ?? undefined
            }
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
          {mobility.length ? (
            <View style={mobilityList.listGap}>
              {mobility.map((item) => {
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
