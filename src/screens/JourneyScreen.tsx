import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { type LiveData } from '../types';
import { Bullet, Card, Row, styles } from '../ui';
import { fanHighlights } from '../demo';

export function JourneyScreen({ data }: { data: LiveData }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>JOURNEY</Text>
          <Text style={styles.title}>Plan, book and depart</Text>
          <Text style={styles.subtitle}>Reservation flow, step-by-step trip guidance and booking history.</Text>
        </View>
        <Card title="Journey planner" subtitle="Trip setup" wide>
          {fanHighlights.map((item) => <Bullet key={item}>{item}</Bullet>)}
        </Card>
        <Card title="Booking checkout" subtitle="Reservation flow">
          {data.bookings.map((item) => (
            <Row key={item.id} leftTitle={item.fanName} leftSubtitle={`${item.option} · ${item.status}`} rightTitle={item.time} rightSubtitle="Departure" />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
