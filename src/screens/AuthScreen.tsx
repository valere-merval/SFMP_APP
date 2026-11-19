import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { login } from '../api';
import { t, type Locale, SUPPORTED_LANGUAGES } from '../i18n';
import { Bullet, Card, ErrorText, Input, PrimaryButton, SecondaryButton, styles } from '../ui';

type AuthMode = 'signin' | 'register' | 'reset';

export function AuthScreen({
  locale,
  onLocaleChange,
  onAuthenticated,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<string>(locale);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const overview = useMemo(
    () => [
      t(locale, 'auth.feature.journey'),
      t(locale, 'auth.feature.maps'),
      t(locale, 'auth.feature.pass'),
      t(locale, 'auth.feature.operations'),
    ],
    [locale],
  );

  const submit = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!email.trim()) {
        throw new Error(mode === 'reset' ? t(locale, 'auth.warning.resetFields') : mode === 'register' ? t(locale, 'auth.warning.registerFields') : t(locale, 'auth.warning.loginFields'));
      }

      if (mode === 'signin') {
        if (!password) {
          throw new Error(t(locale, 'auth.warning.loginFields'));
        }
        await login(email.trim(), password);
      } else if (mode === 'register') {
        if (!password || !firstName.trim() || !lastName.trim()) {
          throw new Error(t(locale, 'auth.warning.registerFields'));
        }
        if (password !== confirmPassword) {
          throw new Error(t(locale, 'auth.warning.passwordMismatch'));
        }
        await login(email.trim(), password);
      } else {
        if (!password) {
          throw new Error(t(locale, 'auth.warning.resetFields'));
        }
        if (password !== confirmPassword) {
          throw new Error(t(locale, 'auth.warning.passwordMismatch'));
        }
        await login(email.trim(), password);
      }

      onAuthenticated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(locale, 'auth.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{t(locale, 'auth.brand')}</Text>
          <Text style={styles.title}>
            {mode === 'register' ? t(locale, 'auth.create.title') : mode === 'reset' ? t(locale, 'auth.reset.title') : t(locale, 'auth.signin.title')}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'register' ? t(locale, 'auth.create.subtitle') : mode === 'reset' ? t(locale, 'auth.reset.subtitle') : t(locale, 'auth.signin.subtitle')}
          </Text>
        </View>

        <Card title={t(locale, 'auth.brand')} subtitle="Secure access">
          <View style={styles.chipsRow}>
            <Pressable style={[styles.tabChip, mode === 'signin' && styles.tabChipActive]} onPress={() => setMode('signin')}>
              <Text style={[styles.tabChipText, mode === 'signin' && styles.tabChipTextActive]}>{t(locale, 'auth.switch.signin')}</Text>
            </Pressable>
            <Pressable style={[styles.tabChip, mode === 'register' && styles.tabChipActive]} onPress={() => setMode('register')}>
              <Text style={[styles.tabChipText, mode === 'register' && styles.tabChipTextActive]}>{t(locale, 'auth.switch.register')}</Text>
            </Pressable>
            <Pressable style={[styles.tabChip, mode === 'reset' && styles.tabChipActive]} onPress={() => setMode('reset')}>
              <Text style={[styles.tabChipText, mode === 'reset' && styles.tabChipTextActive]}>{t(locale, 'auth.switch.reset')}</Text>
            </Pressable>
          </View>

          <View style={styles.chipsRow}>
            {SUPPORTED_LANGUAGES.map((code) => (
              <Pressable key={code} style={[styles.langChip, locale === code && styles.langChipActive]} onPress={() => { onLocaleChange(code as Locale); setPreferredLanguage(code); }}>
                <Text style={[styles.langChipText, locale === code && styles.langChipTextActive]}>{code.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>

          <Input placeholder={t(locale, 'auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          {mode === 'register' ? (
            <>
              <Input placeholder={t(locale, 'auth.firstName')} value={firstName} onChangeText={setFirstName} />
              <Input placeholder={t(locale, 'auth.lastName')} value={lastName} onChangeText={setLastName} />
              <Input placeholder={t(locale, 'auth.country')} value={country} onChangeText={setCountry} />
              <Input placeholder={t(locale, 'auth.city')} value={city} onChangeText={setCity} />
              <Input placeholder={t(locale, 'auth.language')} value={preferredLanguage} onChangeText={(value) => setPreferredLanguage(value)} />
              <Input placeholder={t(locale, 'auth.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </>
          ) : null}

          <Input placeholder={mode === 'reset' ? t(locale, 'auth.newPassword') : t(locale, 'auth.password')} value={password} onChangeText={setPassword} secureTextEntry />
          {mode !== 'signin' ? <Input placeholder={t(locale, 'auth.confirmPassword')} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry /> : null}

          {error ? <ErrorText>{error}</ErrorText> : null}
          <PrimaryButton
            label={mode === 'register' ? t(locale, 'auth.create.button') : mode === 'reset' ? t(locale, 'auth.reset.button') : t(locale, 'auth.signin.button')}
            onPress={submit}
            icon={<Feather name={mode === 'register' ? 'user-plus' : mode === 'reset' ? 'unlock' : 'log-in'} size={16} color="#fff" />}
          />
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>
              {mode === 'register' ? t(locale, 'auth.help.register') : mode === 'reset' ? t(locale, 'auth.help.reset') : t(locale, 'auth.help.signin')}
            </Text>
            <SecondaryButton
              label={mode === 'register' ? t(locale, 'auth.switch.signin') : mode === 'reset' ? t(locale, 'auth.switch.signin') : t(locale, 'auth.switch.reset')}
              onPress={() => setMode(mode === 'register' ? 'signin' : mode === 'reset' ? 'signin' : 'reset')}
              icon={<Feather name="arrow-right" size={16} color="#1d3fb3" />}
            />
          </View>
        </Card>

        <Card title={t(locale, 'auth.whatYouGet')} subtitle="Overview">
          {overview.map((item) => (
            <Bullet key={item}>{item}</Bullet>
          ))}
        </Card>
        <Text style={styles.helperText}>{loading ? t(locale, 'common.loading') : t(locale, 'common.live')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
