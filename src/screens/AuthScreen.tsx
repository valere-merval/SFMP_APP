import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { City, Country } from 'country-state-city';
import Feather from 'react-native-vector-icons/Feather';
import { registerAccount, resetPassword, uploadDocument } from '../api';
import { t, type Locale, SUPPORTED_LANGUAGES } from '../i18n';
import { AvatarPhoto, BrandLogo, Bullet, Card, ErrorText, Input, PrimaryButton, SecondaryButton, styles } from '../ui';


type AuthMode = 'signin' | 'register' | 'reset';

type Option = { key: string; label: string };

const LANGUAGE_OPTIONS: Option[] = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
  { key: 'fr', label: 'Français' },
  { key: 'de', label: 'Deutsch' },
  { key: 'pt', label: 'Português' },
  { key: 'ar', label: 'العربية' },
  { key: 'zh', label: '中文' },
  { key: 'ru', label: 'Русский' },
];

const allCountries = Country.getAllCountries().map((country) => ({
  key: country.isoCode,
  label: country.name,
  dialCode: `+${country.phonecode}`,
}));

function SearchableDropdown({
  label,
  value,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  options,
  onSelect,
  disabled = false,
  selectedKey,
}: {
  label: string;
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  options: Option[];
  onSelect: (option: Option) => void;
  disabled?: boolean;
  selectedKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return options.filter((option) => !term || option.label.toLowerCase().includes(term));
  }, [options, query]);

  return (
    <>
      <Pressable onPress={() => !disabled && setOpen(true)} style={[authStyles.dropdown, disabled && authStyles.dropdownDisabled]}>
        <View style={authStyles.dropdownTextBlock}>
          <Text style={authStyles.dropdownLabel}>{label}</Text>
          <Text style={[authStyles.dropdownValue, !value && authStyles.dropdownPlaceholder]} numberOfLines={1}>
            {value || placeholder}
          </Text>
        </View>
        <Feather name="chevron-down" size={18} color={disabled ? '#94a3b8' : '#22d3ee'} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={authStyles.modalBackdrop}>
          <Pressable style={authStyles.modalBackdropPress} onPress={() => setOpen(false)} />
          <View style={authStyles.modalSheet}>
            <Text style={authStyles.modalTitle}>{label}</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor="#94a3b8"
              style={authStyles.modalSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <ScrollView style={authStyles.modalList} keyboardShouldPersistTaps="handled">
              {filtered.length ? filtered.map((option) => (
                <Pressable
                  key={option.key}
                  style={authStyles.modalOption}
                  onPress={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Text style={authStyles.modalOptionText}>{option.label}</Text>
                  {(selectedKey ? selectedKey === option.key : value === option.label) ? <Feather name="check" size={16} color="#22d3ee" /> : null}
                </Pressable>
              )) : (
                <Text style={authStyles.modalEmpty}>{emptyLabel}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={authStyles.passwordField}>
      <Text style={authStyles.passwordLabel}>{label}</Text>
      <View style={authStyles.passwordRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          style={authStyles.passwordInput}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={() => setVisible((current) => !current)} style={authStyles.eyeButton}>
          <Feather name={visible ? 'eye-off' : 'eye'} size={18} color="#22d3ee" />
        </Pressable>
      </View>
    </View>
  );
}

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
  const [countryCode, setCountryCode] = useState('');
  const [city, setCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Locale>(locale);
  const [phonePrefix, setPhonePrefix] = useState('');
  const [phonePrefixCode, setPhonePrefixCode] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPreferredLanguage(locale);
  }, [locale]);

  const countryOptions = useMemo(
    () => allCountries.map((item) => ({ key: item.key, label: `${item.label} (${item.dialCode})` })),
    [],
  );

  const cityOptions = useMemo(() => {
    if (!countryCode) return [];
    return (City.getCitiesOfCountry(countryCode) ?? []).map((item) => ({ key: item.name, label: item.name }));
  }, [countryCode]);

  const languageOptions = useMemo(() => LANGUAGE_OPTIONS, []);

  const phonePrefixOptions = useMemo(() => allCountries.map((item) => ({ key: item.key, label: `${item.label} (+${item.dialCode})` })), []);

  const overview = useMemo(
    () => [
      t(locale, 'auth.feature.journey'),
      t(locale, 'auth.feature.maps'),
      t(locale, 'auth.feature.pass'),
      t(locale, 'auth.feature.operations'),
    ],
    [locale],
  );

  const onCountrySelect = (code: string, label: string) => {
    setCountryCode(code);
    setCountry(label);
    setCity('');
    const match = allCountries.find((item) => item.key === code);
    if (match && !phonePrefix) {
      setPhonePrefix(match.dialCode);
      setPhonePrefixCode(match.key);
    }
  };

  const pickPhoto = async () => {
    setPhotoUploading(true);
    setError(null);
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
        presentationStyle: 'fullScreen',
      });
      const file = response.assets?.[0];
      if (response.didCancel || !file?.uri) {
        return;
      }
      const uploaded = await uploadDocument({ uri: file.uri, name: file.fileName ?? 'profile.jpg', type: file.type ?? 'image/jpeg' });
      setPhotoUrl(uploaded.url);
    } catch (caught: any) {
      setError(caught?.message ?? t(locale, 'auth.error.generic'));
    } finally {
      setPhotoUploading(false);
    }
  };

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
        const { login } = await import('../api');
        await login(email.trim(), password);
      } else if (mode === 'register') {
        if (!password || !firstName.trim() || !lastName.trim()) {
          throw new Error(t(locale, 'auth.warning.registerFields'));
        }
        if (!country || !city || !phonePrefix || !preferredLanguage) {
          throw new Error(t(locale, 'auth.warning.registerFields'));
        }
        if (password !== confirmPassword) {
          throw new Error(t(locale, 'auth.warning.passwordMismatch'));
        }
        await registerAccount({
          email: email.trim(),
          password,
          firstName,
          lastName,
          country,
          city,
          phone: phone.trim(),
          phonePrefix,
          preferredLanguage,
          photoUrl: photoUrl || null,
          accountType: 'FAN',
        });
      } else {
        if (!password) {
          throw new Error(t(locale, 'auth.warning.resetFields'));
        }
        if (password !== confirmPassword) {
          throw new Error(t(locale, 'auth.warning.passwordMismatch'));
        }
        await resetPassword({ email: email.trim(), newPassword: password });
      }

      onAuthenticated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(locale, 'auth.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <ScrollView
        contentContainerStyle={[styles.container, authStyles.authContainer]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, authStyles.authHeader]}>
          <View style={authStyles.heroTopRow}>
            <View style={authStyles.brandChip}>
              <BrandLogo compact />
              <View style={authStyles.brandTextBlock}>
                <Text style={authStyles.heroKicker}>{t(locale, 'auth.brand')}</Text>
                <Text style={authStyles.heroMiniTitle}>{t(locale, 'auth.signin.title')}</Text>
              </View>
            </View>
            <View style={authStyles.liveBadge}>
              <View style={authStyles.liveDot} />
              <Text style={authStyles.liveBadgeText}>STADIUM LIVE</Text>
            </View>
          </View>

          <View style={authStyles.noticeBanner}>
            <View style={authStyles.noticeLeft}>
              <Feather name="shield" size={16} color="#9df5ff" />
              <View style={authStyles.noticeTextBlock}>
                <Text style={authStyles.noticeTitle}>{t(locale, 'auth.brand')}</Text>
                <Text style={authStyles.noticeSubtitle}>{t(locale, 'auth.signin.subtitle')}</Text>
              </View>
            </View>
            <Text style={authStyles.noticePill}>{t(locale, 'common.live')}</Text>
          </View>

          <View style={authStyles.heroBody}>
            <Text style={authStyles.heroTitle}>
              {mode === 'register'
                ? t(locale, 'auth.create.title')
                : mode === 'reset'
                ? t(locale, 'auth.reset.title')
                : t(locale, 'auth.signin.title')}
            </Text>
            <Text style={authStyles.heroSubtitle}>
              {mode === 'register'
                ? t(locale, 'auth.create.subtitle')
                : mode === 'reset'
                ? t(locale, 'auth.reset.subtitle')
                : t(locale, 'auth.signin.subtitle')}
            </Text>
          </View>

          <View style={authStyles.heroStatsRow}>
            <View style={authStyles.heroStatCard}>
              <Text style={authStyles.heroStatLabel}>{t(locale, 'common.live')}</Text>
              <Text style={authStyles.heroStatValue}>100%</Text>
            </View>
            <View style={authStyles.heroStatCard}>
              <Text style={authStyles.heroStatLabel}>{t(locale, 'auth.language')}</Text>
              <Text style={authStyles.heroStatValue}>{locale.toUpperCase()}</Text>
            </View>
            <View style={authStyles.heroStatCard}>
              <Text style={authStyles.heroStatLabel}>{t(locale, 'auth.brand')}</Text>
              <Text style={authStyles.heroStatValue}>SFMP</Text>
            </View>
          </View>
        </View>

        <Card title={mode === 'register' ? t(locale, 'auth.create.title') : mode === 'reset' ? t(locale, 'auth.reset.title') : t(locale, 'auth.signin.title')} subtitle={t(locale, 'auth.brand')}>
          <View style={styles.chipsRow}>
            <Pressable
              style={[
                styles.tabChip,
                mode === 'signin' && styles.tabChipActive,
              ]}
              onPress={() => setMode('signin')}
            >
              <Text
                style={[
                  styles.tabChipText,
                  mode === 'signin' && styles.tabChipTextActive,
                ]}
              >
                {t(locale, 'auth.switch.signin')}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabChip,
                mode === 'register' && styles.tabChipActive,
              ]}
              onPress={() => setMode('register')}
            >
              <Text
                style={[
                  styles.tabChipText,
                  mode === 'register' && styles.tabChipTextActive,
                ]}
              >
                {t(locale, 'auth.switch.register')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabChip, mode === 'reset' && styles.tabChipActive]}
              onPress={() => setMode('reset')}
            >
              <Text
                style={[
                  styles.tabChipText,
                  mode === 'reset' && styles.tabChipTextActive,
                ]}
              >
                {t(locale, 'auth.switch.reset')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.chipsRow}>
            {SUPPORTED_LANGUAGES.map(code => (
              <Pressable
                key={code}
                style={[
                  styles.langChip,
                  locale === code && styles.langChipActive,
                ]}
                onPress={() => {
                  onLocaleChange(code as Locale);
                  setPreferredLanguage(code as Locale);
                }}
              >
                <Text
                  style={[
                    styles.langChipText,
                    locale === code && styles.langChipTextActive,
                  ]}
                >
                  {code.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input
            placeholder={t(locale, 'auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {mode === 'register' ? (
            <>
              <Input
                placeholder={t(locale, 'auth.firstName')}
                value={firstName}
                onChangeText={setFirstName}
              />
              <Input
                placeholder={t(locale, 'auth.lastName')}
                value={lastName}
                onChangeText={setLastName}
              />
              <SearchableDropdown
                label={t(locale, 'auth.country')}
                value={country}
                placeholder={t(locale, 'auth.countryPlaceholder')}
                searchPlaceholder={t(locale, 'auth.searchCountries')}
                emptyLabel={t(locale, 'profile.noSearchResults')}
                options={countryOptions}
                selectedKey={countryCode}
                onSelect={option =>
                  onCountrySelect(
                    option.key,
                    option.label.replace(/\s*\(.*\)$/, ''),
                  )
                }
              />
              <SearchableDropdown
                label={t(locale, 'auth.city')}
                value={city}
                placeholder={
                  countryCode
                    ? t(locale, 'auth.cityPlaceholder')
                    : t(locale, 'profile.chooseCountryFirst')
                }
                searchPlaceholder={t(locale, 'auth.searchCities')}
                emptyLabel={
                  countryCode
                    ? t(locale, 'profile.noSearchResults')
                    : t(locale, 'profile.chooseCountryFirst')
                }
                options={cityOptions}
                disabled={!countryCode}
                selectedKey={city}
                onSelect={option => setCity(option.label)}
              />
              <SearchableDropdown
                label={t(locale, 'auth.language')}
                value={preferredLanguage}
                placeholder={t(locale, 'auth.languagePlaceholder')}
                searchPlaceholder={t(locale, 'auth.searchLanguages')}
                emptyLabel={t(locale, 'profile.noSearchResults')}
                options={languageOptions}
                selectedKey={preferredLanguage}
                onSelect={option => {
                  setPreferredLanguage(option.key as Locale);
                  onLocaleChange(option.key as Locale);
                }}
              />
              <SearchableDropdown
                label={t(locale, 'auth.phonePrefix')}
                value={phonePrefix}
                placeholder={t(locale, 'auth.phonePrefixPlaceholder')}
                searchPlaceholder={t(locale, 'auth.searchPrefixes')}
                emptyLabel={t(locale, 'profile.noSearchResults')}
                options={phonePrefixOptions}
                selectedKey={phonePrefixCode}
                onSelect={option => {
                  const selected = allCountries.find(
                    item => item.key === option.key,
                  );
                  setPhonePrefix(selected ? selected.dialCode : option.label);
                  setPhonePrefixCode(option.key);
                }}
              />
              <Input
                placeholder={t(locale, 'auth.phone')}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Pressable style={authStyles.photoButton} onPress={pickPhoto}>
                <Feather name="camera" size={18} color="#09111f" />
                <Text style={authStyles.photoButtonText}>
                  {photoUrl
                    ? t(locale, 'auth.photoChange')
                    : t(locale, 'auth.photoUpload')}
                </Text>
              </Pressable>
              <View style={authStyles.photoPreview}>
                <AvatarPhoto
                  uri={photoUrl || null}
                  label={
                    `${firstName} ${lastName}`.trim() ||
                    email ||
                    t(locale, 'auth.photoUpload')
                  }
                  size={72}
                />
                <View style={authStyles.photoPreviewText}>
                  <Text style={styles.helperText}>
                    {photoUrl
                      ? t(locale, 'auth.photoUploaded')
                      : t(locale, 'auth.photoHint')}
                  </Text>
                  <Text style={styles.helperText}>
                    {photoUrl
                      ? t(locale, 'auth.photoChange')
                      : t(locale, 'auth.photoUpload')}
                  </Text>
                </View>
              </View>
            </>
          ) : null}

          <PasswordField
            label={
              mode === 'reset'
                ? t(locale, 'auth.newPassword')
                : t(locale, 'auth.password')
            }
            value={password}
            onChangeText={setPassword}
            placeholder={
              mode === 'reset'
                ? t(locale, 'auth.newPassword')
                : t(locale, 'auth.password')
            }
          />
          {mode !== 'signin' ? (
            <PasswordField
              label={t(locale, 'auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t(locale, 'auth.confirmPassword')}
            />
          ) : null}

          {error ? <ErrorText>{error}</ErrorText> : null}
          <PrimaryButton
            label={
              mode === 'register'
                ? t(locale, 'auth.create.button')
                : mode === 'reset'
                ? t(locale, 'auth.reset.button')
                : t(locale, 'auth.signin.button')
            }
            onPress={submit}
            icon={
              <Feather
                name={
                  mode === 'register'
                    ? 'user-plus'
                    : mode === 'reset'
                    ? 'unlock'
                    : 'log-in'
                }
                size={16}
                color="#fff"
              />
            }
          />
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>
              {mode === 'register'
                ? t(locale, 'auth.help.register')
                : mode === 'reset'
                ? t(locale, 'auth.help.reset')
                : t(locale, 'auth.help.signin')}
            </Text>
            <SecondaryButton
              label={
                mode === 'register'
                  ? t(locale, 'auth.switch.signin')
                  : mode === 'reset'
                  ? t(locale, 'auth.switch.signin')
                  : t(locale, 'auth.switch.reset')
              }
              onPress={() =>
                setMode(
                  mode === 'register'
                    ? 'signin'
                    : mode === 'reset'
                    ? 'signin'
                    : 'reset',
                )
              }
            />
          </View>
        </Card>

        <Card title={t(locale, 'auth.whatYouGet')} subtitle="Overview">
          {overview.map(item => (
            <Bullet key={item}>{item}</Bullet>
          ))}
        </Card>
        <Text style={styles.helperText}>
          {loading ? t(locale, 'common.loading') : t(locale, 'common.live')}
        </Text>
        {photoUploading ? (
          <Text style={styles.helperText}>
            {t(locale, 'common.processing')}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const authStyles = StyleSheet.create({
  authHeader: {
    paddingTop: 0,
    paddingBottom: 8,
    gap: 12,
  },
  authContainer: {
    paddingTop: 0,
    paddingBottom: 18,
    marginBottom: 0,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  brandTextBlock: { flex: 1, minWidth: 0, gap: 1 },
  heroKicker: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  heroMiniTitle: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    lineHeight: 18,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.18)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#c8f36a',
  },
  liveBadgeText: {
    color: '#c8f36a',
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(157, 245, 255, 0.12)',
    backgroundColor: 'rgba(11, 18, 32, 0.84)',
  },
  noticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  noticeTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  noticeTitle: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
  },
  noticeSubtitle: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  noticePill: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  heroBody: {
    gap: 8,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroStatCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 92,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(11, 18, 32, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.14)',
    gap: 4,
  },
  heroStatLabel: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroStatValue: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 27,
    lineHeight: 32,
    fontFamily: 'Poppins-Bold',
  },
  heroSubtitle: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  dropdown: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownDisabled: { opacity: 0.7 },
  dropdownTextBlock: { flex: 1, gap: 2 },
  dropdownLabel: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  dropdownValue: { color: '#f8fafc', fontFamily: 'Poppins-SemiBold' },
  dropdownPlaceholder: { color: '#7c8ba3' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 13, 24, 0.82)',
    justifyContent: 'flex-end',
  },
  modalBackdropPress: { ...StyleSheet.absoluteFill },
  modalSheet: {
    backgroundColor: '#0f1728',
    padding: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontFamily: 'Teko',
    marginBottom: 10,
  },
  modalSearch: {
    backgroundColor: '#0b1220',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    color: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
  },
  modalList: { maxHeight: 360 },
  modalOption: {
    backgroundColor: '#0b1220',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalOptionText: {
    color: '#f8fafc',
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  modalEmpty: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Medium',
    paddingVertical: 12,
  },
  passwordField: { gap: 6 },
  passwordLabel: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    backgroundColor: '#0b1220',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    color: '#f8fafc',
    paddingVertical: 12,
    fontFamily: 'Poppins-Medium',
  },
  eyeButton: { padding: 8 },
  photoButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#c8f36a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  photoButtonText: { color: '#09111f', fontFamily: 'Poppins-SemiBold' },
  photoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    backgroundColor: '#0b1220',
  },
  photoPreviewText: { flex: 1, gap: 4 },
});
