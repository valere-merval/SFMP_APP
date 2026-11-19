import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, EmptyState, styles } from '../ui';

export function PassScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>PASS</Text>
          <Text style={styles.title}>Digital transit pass</Text>
          <Text style={styles.subtitle}>Backend-issued pass details and transit eligibility live here.</Text>
        </View>
        <Card title="Matchday access" subtitle="Confirmation" wide>
          <View style={styles.passCard}>
            <View style={styles.passHeader}>
              <View style={styles.passIcon}>
                <Ionicons name="ticket-outline" size={20} color="#fff" />
              </View>
              <View style={styles.passHeaderContent}>
                <Text style={styles.passKicker}>MATCHDAY PASS</Text>
                <Text style={styles.passTitle}>Transit access from the backend</Text>
              </View>
            </View>
            <Text style={styles.passMeta}>The pass screen now waits for live backend data instead of a local QR mock.</Text>
            <View style={styles.bulletRow}>
              <Feather name="shield" size={16} color="#cbd5e1" />
              <Text style={styles.mutedLight}>Secure account required</Text>
            </View>
            <View style={styles.bulletRow}>
              <Feather name="map-pin" size={16} color="#cbd5e1" />
              <Text style={styles.mutedLight}>Routes and eligibility reflect live backend state</Text>
            </View>
          </View>
        </Card>
        <Card title="No local pass fixture" subtitle="Runtime state">
          <EmptyState icon="document-lock-outline" title="Backend only" subtitle="This screen no longer renders a placeholder QR or demo pass data." />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
