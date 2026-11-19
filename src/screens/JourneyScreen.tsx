import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { type LiveData } from '../types';
import { Card, EmptyState, Row, styles } from '../ui';

export function JourneyScreen({ data, loading }: { data: LiveData | null; loading: boolean }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>JOURNEY</Text>
          <Text style={styles.title}>Plan, book and depart</Text>
          <Text style={styles.subtitle}>Reservation flow, step-by-step trip guidance and backend-driven booking history.</Text>
        </View>
        <Card title="Journey planner" subtitle="Trip setup" wide>
          <View style={styles.cardBody}>
            {[
              { icon: <Ionicons name="compass-outline" size={16} color="#2457e6" />, title: 'Plan your route', subtitle: 'Pick the fastest path from the live catalog.' },
              { icon: <Feather name="clock" size={16} color="#2457e6" />, title: 'Choose a departure window', subtitle: 'Match your trip to the matchday schedule.' },
              { icon: <Feather name="check-circle" size={16} color="#2457e6" />, title: 'Confirm once', subtitle: 'Use the backend account to keep the journey synced.' },
            ].map((item) => (
              <View key={item.title} style={styles.bulletRow}>
                {item.icon}
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.muted}>{item.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
        <Card title="Booking checkout" subtitle="Reservation flow">
          {data ? (
            data.bookings.map((item) => (
              <Row key={item.id} leftTitle={item.fanName} leftSubtitle={`${item.option} · ${item.status}`} rightTitle={item.time} rightSubtitle="Departure" />
            ))
          ) : loading ? (
            <EmptyState icon="time-outline" title="Loading bookings" subtitle="Booking rows are fetched from the backend catalog." />
          ) : (
            <EmptyState icon="ticket-outline" title="No booking data" subtitle="Sign in to load live booking history from the backend." />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
