import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Card, styles } from '../ui';

export function PassScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>PASS</Text>
          <Text style={styles.title}>Digital transit pass</Text>
          <Text style={styles.subtitle}>Free transit with pass and offline backup availability.</Text>
        </View>
        <Card title="Matchday access" subtitle="Confirmation" wide>
          <View style={styles.passCard}>
            <Text style={styles.passKicker}>UCL MATCHDAY PASS</Text>
            <Text style={styles.passTitle}>Free transit with pass</Text>
            <Text style={styles.passMeta}>Metro, shuttle and priority corridor access enabled.</Text>
            <View style={styles.qrMock} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
