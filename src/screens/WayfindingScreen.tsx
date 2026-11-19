import React from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { openGoogleMapsDirections, openGoogleMapsSearch } from '../maps';
import { Card, Pill, PrimaryButton, SecondaryButton, styles } from '../ui';

export function WayfindingScreen({
  venueName = 'Estadio Metropolitano',
  city = 'Madrid',
  country = 'Spain',
}: {
  venueName?: string;
  city?: string;
  country?: string;
}) {
  const title = `${venueName}, ${city}`;
  const venueCoordinate = {
    latitude: 40.4531,
    longitude: -3.6883,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>WAYFINDING</Text>
          <Text style={styles.title}>Interactive mobility map</Text>
          <Text style={styles.subtitle}>Native map surface with backend-backed links to Google Maps for routing.</Text>
        </View>
        <Card title="Route map" subtitle="Live routing" wide>
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
              <Marker coordinate={venueCoordinate} title={title} description="Match venue" />
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.cardTitle}>{venueName}</Text>
              <Text style={styles.muted}>{city}, {country}</Text>
              <Text style={styles.muted}>The app renders a native map here and uses Google Maps links for route handoff.</Text>
            </View>
          </View>
          <View style={styles.ctaRow}>
            <PrimaryButton
              label="Open in Google Maps"
              onPress={() => openGoogleMapsSearch(title)}
              icon={<Ionicons name="navigate-outline" size={16} color="#fff" />}
            />
            <SecondaryButton
              label="View directions"
              onPress={() => openGoogleMapsDirections(title, 'Madrid city center')}
              icon={<Feather name="external-link" size={16} color="#1d3fb3" />}
            />
          </View>
        </Card>
        <Card title="Route filters" subtitle="Search">
          <View style={styles.chipsRow}>
            <Pill subtle>All routes</Pill>
            <Pill subtle>Fastest</Pill>
            <Pill subtle>Free with pass</Pill>
            <Pill subtle>Step-free</Pill>
          </View>
        </Card>
        <Card title="App-shell handoff" subtitle="Transport" wide>
          <View style={styles.bulletRow}>
            <Feather name="map" size={16} color="#2457e6" />
            <Text style={styles.muted}>Native map is embedded in the shell; no local demo route data is rendered.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="open-outline" size={16} color="#2457e6" />
            <Text style={styles.muted}>If the map tiles are unavailable on Android, the external Google Maps links still work.</Text>
          </View>
          <View style={styles.ctaRow}>
            <SecondaryButton label="Search venue" onPress={() => Linking.openURL('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(title))} icon={<Feather name="search" size={16} color="#1d3fb3" />} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
