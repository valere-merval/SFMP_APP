import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { type LiveData } from '../types';
import { Card, Row, styles } from '../ui';

export function ProfileScreen({ data }: { data: LiveData }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>PROFILE</Text>
          <Text style={styles.title}>Fan and admin identity</Text>
          <Text style={styles.subtitle}>Account preferences, travel history and admin visibility.</Text>
        </View>
        <Card title="Fan profile" subtitle="Account" wide>
          <Row leftTitle="Amina Diallo" leftSubtitle="Fan profile" rightTitle="Madrid" rightSubtitle="City" />
          <Row leftTitle="Preferences" leftSubtitle="Step-free routes · Notifications on" rightTitle="Active" rightSubtitle="Settings" />
        </Card>
        <Card title="Travel history" subtitle="Recent trips">
          {data.events.map((item) => (
            <Row key={item.id} leftTitle={item.title} leftSubtitle={`${item.venue} · ${item.city}`} rightTitle={item.date} rightSubtitle={item.status} />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
