import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { login } from '../api';
import { Bullet, Card, ErrorText, Input, PrimaryButton, SecondaryButton, styles } from '../ui';

export function AuthScreen({ onContinue }: { onContinue: () => void }) {
  const [username, setUsername] = useState('fan@sfmp.local');
  const [password, setPassword] = useState('fan123');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      setError(null);
      await login(username, password);
      onContinue();
    } catch {
      setError('Invalid credentials. Try fan@sfmp.local / fan123, ops@sfmp.local / ops123, or admin@sfmp.local / admin123.');
    }
  };

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
          <Input placeholder="Username" value={username} onChangeText={setUsername} />
          <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          {error ? <ErrorText>{error}</ErrorText> : null}
          <View style={styles.ctaRow}>
            <PrimaryButton label="Sign in" onPress={submit} />
            <SecondaryButton label="Guest mode" onPress={onContinue} />
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
