import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { openGoogleMapsDirections } from '../maps';
import type { LiveData, MobilityCard } from '../types';
import { Card, EmptyState, Pill, PrimaryButton, SecondaryButton, styles } from '../ui';
import { t, type Locale } from '../i18n';

type MicroMobilityScreenProps = {
  locale: Locale;
  data: LiveData | null;
  venueName?: string;
  city?: string;
  country?: string;
};

const defaultRegion = {
  latitude: 40.4531,
  longitude: -3.6883,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

function mobilityLabel(item: MobilityCard) {
  const normalized = item.mode.toLowerCase();
  if (normalized.includes('bike') || normalized.includes('bicycle')) return { label: 'Bike', icon: 'bicycle-outline' as const };
  return { label: 'Scooter', icon: 'scooter-outline' as const };
}

export function MicroMobilityScreen({ locale, data, venueName, city, country }: MicroMobilityScreenProps) {
  const mobility = useMemo(
    () => (data?.mobility ?? []).filter((item) => /scooter|bike|bicycle/i.test(item.mode)),
    [data],
  );
  const [selectedId, setSelectedId] = useState(mobility[0]?.id ?? '');
  const selected = mobility.find((item) => item.id === selectedId) ?? mobility[0] ?? null;
  const mapQuery = [venueName, city, country].filter(Boolean).join(', ');

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EmptyState icon="bicycle-outline" title={t(locale, 'common.loading')} subtitle={t(locale, 'common.loading')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{t(locale, 'nav.mobility')}</Text>
          <Text style={styles.title}>{t(locale, 'nav.mobility')}</Text>
          <Text style={styles.subtitle}>{venueName ?? mapQuery}</Text>
        </View>

        <Card title={t(locale, 'common.liveMap')} subtitle={t(locale, 'common.pickupTracking')} wide>
          <View style={styles.mapPanel}>
            <MapView
              style={styles.mapView}
              provider={PROVIDER_GOOGLE}
              initialRegion={defaultRegion}
              showsCompass={false}
              showsTraffic
            >
              <Marker coordinate={{ latitude: defaultRegion.latitude, longitude: defaultRegion.longitude }} title={venueName ?? t(locale, 'common.destination')} description={mapQuery || venueName || ''} />
            </MapView>
            <View style={styles.mapOverlay}>
              <View style={styles.rowBetween}>
                <View style={styles.rowLeft}>
                  <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
                    {selected ? mobilityLabel(selected).label : t(locale, 'common.noProviders')}
                  </Text>
                  <Text style={styles.muted}>{selected ? selected.mode : mapQuery}</Text>
                </View>
                {selected ? <Pill subtle>{selected.badge}</Pill> : null}
              </View>
              <Text style={styles.helperText}>
                {selected ? `${selected.duration} · ${selected.price}` : t(locale, 'common.backendUnavailable')}
              </Text>
              <View style={styles.ctaRow}>
                <SecondaryButton
                  label={t(locale, 'common.openInGoogleMaps')}
                  onPress={() => {
                    openGoogleMapsDirections(mapQuery || venueName || '').catch(() => undefined);
                  }}
                  icon={<Feather name="map" size={16} color="#1d3fb3" />}
                />
                <PrimaryButton
                  label={t(locale, 'common.navigate')}
                  onPress={() => {
                    openGoogleMapsDirections(mapQuery || venueName || '').catch(() => undefined);
                  }}
                  icon={<Ionicons name="walk-outline" size={16} color="#172033" />}
                />
              </View>
            </View>
          </View>
        </Card>

        <Card title={t(locale, 'common.available')} subtitle={t(locale, 'common.liveTracking')} wide>
          {mobility.length ? (
          <View style={{ gap: 12 }}>
          {mobility.map((item) => {
                const isSelected = item.id === selected?.id;
                const label = mobilityLabel(item);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedId(item.id)}
                    style={[styles.miniCard, isSelected && { borderColor: '#D946EF', borderWidth: 1.5 }]}
                  >
                    <View style={styles.rowBetween}>
                      <View style={styles.rowLeft}>
                        <View style={styles.buttonContent}>
                          <View style={styles.buttonIcon}>
                            <Ionicons name={label.icon} size={18} color="#172033" />
                          </View>
                          <Text style={styles.cardTitle}>{label.label}</Text>
                        </View>
                        <Text style={styles.muted}>{item.mode}</Text>
                      </View>
                      <Pill subtle>{item.badge}</Pill>
                    </View>
                    <Text style={styles.helperText}>{item.duration} · {item.price}</Text>
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

export default MicroMobilityScreen;
