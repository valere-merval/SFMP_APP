import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Bullet, Card, PrimaryButton, SecondaryButton, styles } from '../ui';

export function AuthScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SMART FAN MOBILITY</Text>
          <Text style={styles.title}>Sign in to matchday mobility</Text>
          <Text style={styles.subtitle}>
            Use your fan account, operator account or admin account to access the right journey.
          </Text>
        </View>
        <Card title="Continue into the platform" subtitle="Secure access">
          <Text style={styles.muted}>A real auth provider can plug into this screen later.</Text>
          <View style={styles.ctaRow}>
            <PrimaryButton label="Continue" onPress={onContinue} />
            <SecondaryButton label="Use guest mode" onPress={onContinue} />
          </View>
        </Card>
        <Card title="What you get" subtitle="Overview">
          {['Journey planning', 'Wayfinding maps', 'Ticket and transit pass', 'Operations visibility'].map((item) => (
            <Bullet key={item}>{item}</Bullet>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
