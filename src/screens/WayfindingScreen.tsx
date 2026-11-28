import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapboxNaviView from '../components/MapboxNaviView';
import { requestCurrentCoordinates, type Coordinate } from '../location';
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
  selectedMatchId = null,
}: {
  data: LiveData | null;
  locale: Locale;
  venueName?: string;
  city?: string;
  country?: string;
  selectedMatchId?: string | null;
}) {
  const copy = getScreenCopy(locale).wayfinding;
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const title = `${venueName}, ${city}`;
  const venueCoordinate = {
    latitude: 40.4531,
    longitude: -3.6883,
  };
  const transportLines = useMemo(() => {
    const providers = data?.transportProviders ?? [];
    return providers.filter((provider) => {
      const matchOk = !selectedMatchId || provider.matchId === selectedMatchId;
      const mode = provider.providerType.toLowerCase();
      return matchOk && /train|tram|metro|subway|bus/i.test(mode);
    });
  }, [data?.transportProviders, selectedMatchId]);

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
          {transportLines.length ? (
            <View style={styles.grid2}>
              {transportLines.map((provider) => (
                <MiniCard
                  key={provider.id}
                  title={provider.displayName}
                  subtitle={`${provider.providerType} · ${provider.matchTitle}`}
                  meta={`${provider.city}, ${provider.country}${provider.stationAddress ? ` · ${provider.stationAddress}` : ''}`}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="bus-outline"
              title="Aucune ligne pour ce match"
              subtitle="Les trains, tram, métro et bus liés au match sélectionné doivent apparaître ici."
            />
          )}
        </Card>
        <Card title={copy.mapTitle} subtitle={copy.mapSubtitle} wide>
          <View style={styles.mapPanel}>
            <MapboxNaviView
              height={320}
              origin={currentLocation}
              destination={venueCoordinate}
              title={venueName}
              subtitle={`${city}, ${country}`}
              liveLabel={copy.mapSubtitle}
            />
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
              icon={<Feather name="external-link" size={16} color="#22d3ee" />}
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
            <Feather name="map" size={16} color="#22d3ee" />
            <Text style={styles.muted}>{copy.nativeMapBody}</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="open-outline" size={16} color="#22d3ee" />
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
              icon={<Feather name="search" size={16} color="#22d3ee" />}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
