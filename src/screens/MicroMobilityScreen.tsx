import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapboxNaviView from '../components/MapboxNaviView';
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
};

function mobilityLabel(item: MobilityCard) {
  const normalized = item.mode.toLowerCase();
  if (normalized.includes('bike') || normalized.includes('bicycle')) {
    return { label: 'Bike', icon: 'bicycle-outline' as const };
  }
  return { label: 'Scooter', icon: 'scooter-outline' as const };
}

export function MicroMobilityScreen({ locale, data, venueName, city, country }: MicroMobilityScreenProps) {
  const mobility = useMemo(
    () => (data?.mobility ?? []).filter((item) => /scooter|bike|bicycle/i.test(item.mode)),
    [data],
  );
  const [selectedId, setSelectedId] = useState(mobility[0]?.id ?? '');
  const selected = mobility.find((item) => item.id === selectedId) ?? mobility[0] ?? null;
  const mapTitle = venueName ?? ([city, country].filter(Boolean).join(', ') || t(locale, 'common.destination'));

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
          <Text style={styles.subtitle}>{mapTitle}</Text>
        </View>

        <Card title={t(locale, 'common.liveMap')} subtitle={t(locale, 'common.pickupTracking')} wide>
          <MapboxNaviView
            height={320}
            origin={defaultRegion}
            destination={defaultRegion}
            title={selected ? mobilityLabel(selected).label : mapTitle}
            subtitle={selected ? selected.mode : mapTitle}
            liveLabel={selected ? `${selected.duration} · ${selected.price}` : t(locale, 'common.backendUnavailable')}
          />
          <View style={styles.ctaRow}>
            <PrimaryButton
              label={t(locale, 'common.navigate')}
              onPress={() => undefined}
              icon={<Ionicons name="walk-outline" size={16} color="#172033" />}
            />
            <SecondaryButton
              label={t(locale, 'common.openInGoogleMaps')}
              onPress={() => undefined}
              icon={<Ionicons name="map-outline" size={16} color="#1d3fb3" />}
            />
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
