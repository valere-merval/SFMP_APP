import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { openGoogleMapsDirections, openGoogleMapsSearch } from '../maps';
import { Card, Pill, PrimaryButton, SecondaryButton, styles } from '../ui';

export function WayfindingScreen() {
  const venue = 'Santiago Bernabéu, Madrid';
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>WAYFINDING</Text>
          <Text style={styles.title}>Interactive mobility map</Text>
          <Text style={styles.subtitle}>Blue route = fastest. Lime markers = live gates and transfer points.</Text>
        </View>
        <Card title="Route map" subtitle="Live routing" wide>
          <View style={styles.darkMap}>
            <View style={styles.mapOverlayCard}>
              <Text style={styles.cardTitleDark}>Madrid live network</Text>
              <Text style={styles.mutedLight}>Blue route = fastest. Lime markers = live gates and transfer points.</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeNodeStart} />
            <View style={styles.routeNodeMid} />
            <View style={styles.routeNodeEnd} />
          </View>
          <View style={styles.ctaRow}>
            <PrimaryButton label="Open in Google Maps" onPress={() => openGoogleMapsSearch(venue)} />
            <SecondaryButton label="View directions" onPress={() => openGoogleMapsDirections(venue, 'Madrid city center')} />
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
      </ScrollView>
    </SafeAreaView>
  );
}
