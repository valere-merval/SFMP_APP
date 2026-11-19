import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { type LiveData } from '../types';
import { Card, EmptyState, Row, styles } from '../ui';

export function ProfileScreen({ data, loading }: { data: LiveData | null; loading: boolean }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>PROFILE</Text>
          <Text style={styles.title}>Fan and admin identity</Text>
          <Text style={styles.subtitle}>Account preferences, travel history and backend-driven admin visibility.</Text>
        </View>
        <Card title="Fan profile" subtitle="Account" wide>
          <View style={styles.bulletRow}>
            <Feather name="user" size={16} color="#2457e6" />
            <Text style={styles.rowTitle}>Account profile loads from the signed-in backend user</Text>
          </View>
          <Row leftTitle="Preferences" leftSubtitle="Step-free routes · Notifications on" rightTitle="Active" rightSubtitle="Settings" />
        </Card>
        <Card title="Travel history" subtitle="Recent trips">
          {data ? data.events.map((item) => (
            <Row key={item.id} leftTitle={item.title} leftSubtitle={`${item.venue} · ${item.city}`} rightTitle={item.date} rightSubtitle={item.status} />
          )) : loading ? (
            <EmptyState icon="time-outline" title="Loading profile" subtitle="Travel history comes from the backend catalog." />
          ) : (
            <EmptyState icon="person-outline" title="No profile data" subtitle="Sign in to render the live travel history feed." />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
