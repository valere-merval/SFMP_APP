import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Bullet, Card, ErrorText, Input, PrimaryButton, styles } from '../ui';

export function AuthScreen({ onContinue }: { onContinue: (username: string, password: string) => Promise<void> }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      setError(null);
      await onContinue(username, password);
    } catch {
      setError('Sign-in failed. Use backend-issued credentials and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SMART FAN MOBILITY</Text>
          <Text style={styles.title}>Sign in to matchday mobility</Text>
          <Text style={styles.subtitle}>Authenticate against the backend to load live journeys, operations and wayfinding.</Text>
        </View>
        <Card title="Continue into the platform" subtitle="Secure access">
          <Input placeholder="Username" value={username} onChangeText={setUsername} />
          <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          {error ? <ErrorText>{error}</ErrorText> : null}
          <PrimaryButton
            label="Sign in"
            onPress={submit}
            icon={<Feather name="log-in" size={16} color="#fff" />}
          />
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
