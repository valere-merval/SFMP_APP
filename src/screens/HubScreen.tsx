import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { type LiveData } from '../types';
import { Card, MiniCard, Pill, PrimaryButton, Row, SecondaryButton, Stat, styles } from '../ui';

export function HubScreen({ data }: { data: LiveData }) {
  const hero = useMemo(() => data.events[0], [data.events]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SMART FAN MOBILITY</Text>
          <Text style={styles.title}>Smart fan mobility for matchday travel</Text>
          <Text style={styles.subtitle}>
            One product surface for fans, mobility operations and platform administration.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Pill>{hero.status}</Pill>
            <Pill subtle>LIVE</Pill>
          </View>
          <Text style={styles.cardKicker}>Next sporting event</Text>
          <Text style={styles.cardTitle}>{hero.title}</Text>
          <Text style={styles.muted}>{hero.venue} · {hero.city}</Text>
          <View style={styles.statsRow}>
            <Stat label="Date" value={hero.date} />
            <Stat label="Fans" value={hero.attendance} />
            <Stat label="Gate" value="34 East Hub" />
          </View>
          <View style={styles.ctaRow}>
            <PrimaryButton label="Plan my journey" onPress={() => undefined} />
            <SecondaryButton label="View event details" onPress={() => undefined} />
          </View>
        </View>

        <Card title="Transit direct lines" subtitle="Matchday routing" wide>
          <View style={styles.grid2}>
            {data.mobility.map((item) => (
              <MiniCard key={item.id} title={item.mode} subtitle={item.badge} meta={`${item.duration} · ${item.price}`} />
            ))}
          </View>
        </Card>

        <Card title="Perimeter live telemetry" subtitle="Operations feed">
          {data.operations.map((item) => (
            <Row key={item.id} leftTitle={item.label} leftSubtitle={item.trend} rightTitle={item.value} rightSubtitle="Live" />
          ))}
        </Card>

        <Card title="Stadium perimeter gates" subtitle="Wayfinding" wide>
          <View style={styles.mapPanel}>
            <View style={styles.mapOverlay}>
              <Text style={styles.cardTitle}>Gate 34 · East Hub</Text>
              <Text style={styles.muted}>Walk 3 min from the fan zone. Queue time: 8 min.</Text>
            </View>
            <View style={styles.mapDot1} />
            <View style={styles.mapDot2} />
            <View style={styles.mapDot3} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
