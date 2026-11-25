import React from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getScreenCopy } from '../screenCopy';
import { openGoogleMapsDirections, openGoogleMapsSearch } from '../maps';
import {
  Card,
  EmptyState,
  MiniCard,
  Pill,
  PrimaryButton,
  SecondaryButton,
  styles,
} from '../ui';
import { Locale, t } from '../i18n';
import type { LiveData } from '../types.ts';

export function WayfindingScreen({
  data,
  locale,
  venueName = 'Estadio Metropolitano',
  city = 'Madrid',
  country = 'Spain',
}: {
  data: LiveData | null;
  locale: Locale;
  venueName?: string;
  city?: string;
  country?: string;
}) {
  const copy = getScreenCopy(locale).wayfinding;
  const title = `${venueName}, ${city}`;
  const venueCoordinate = {
    latitude: 40.4531,
    longitude: -3.6883,
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>
        <Card title={copy.linesTitle} subtitle={copy.linesSubtitle} wide>
          {data ? (
            <View style={styles.grid2}>
              {data.mobility.filter(item => /bus|train/i.test(item.mode)).map(item => (
                <MiniCard
                  key={item.id}
                  title={item.mode}
                  subtitle={item.badge}
                  meta={`${item.duration} · ${item.price}`}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="bus-outline"
              title={t(locale, 'common.noProviders')}
              subtitle={t(locale, 'common.backendUnavailable')}
            />
          )}
        </Card>
        <Card title={copy.mapTitle} subtitle={copy.mapSubtitle} wide>
          <View style={styles.mapPanel}>
            <MapView
              style={styles.mapView}
              initialRegion={{
                latitude: venueCoordinate.latitude,
                longitude: venueCoordinate.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              showsCompass={false}
              showsTraffic
            >
              <Marker
                coordinate={venueCoordinate}
                title={title}
                description="Match venue"
              />
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.cardTitle}>{venueName}</Text>
              <Text style={styles.muted}>
                {city}, {country}
              </Text>
              <Text style={styles.muted}>{copy.mapBody}</Text>
            </View>
          </View>
          <View style={styles.ctaRow}>
            <PrimaryButton
              label={copy.openMaps}
              onPress={() => openGoogleMapsSearch(title)}
              icon={<Ionicons name="navigate-outline" size={16} color="#fff" />}
            />
            <SecondaryButton
              label={copy.directions}
              onPress={() =>
                openGoogleMapsDirections(title, 'Madrid city center')
              }
              icon={<Feather name="external-link" size={16} color="#1d3fb3" />}
            />
          </View>
        </Card>
        <Card title={copy.filtersTitle} subtitle={copy.filtersSubtitle}>
          <View style={styles.chipsRow}>
            <Pill subtle>{copy.allRoutes}</Pill>
            <Pill subtle>{copy.fastest}</Pill>
            <Pill subtle>{copy.freePass}</Pill>
            <Pill subtle>{copy.stepFree}</Pill>
          </View>
        </Card>
        <Card title={copy.handoffTitle} subtitle={copy.handoffSubtitle} wide>
          <View style={styles.bulletRow}>
            <Feather name="map" size={16} color="#2457e6" />
            <Text style={styles.muted}>{copy.nativeMapBody}</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="open-outline" size={16} color="#2457e6" />
            <Text style={styles.muted}>{copy.fallbackBody}</Text>
          </View>
          <View style={styles.ctaRow}>
            <SecondaryButton
              label={copy.searchVenue}
              onPress={() =>
                Linking.openURL(
                  'https://www.google.com/maps/search/?api=1&query=' +
                    encodeURIComponent(title),
                )
              }
              icon={<Feather name="search" size={16} color="#1d3fb3" />}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
