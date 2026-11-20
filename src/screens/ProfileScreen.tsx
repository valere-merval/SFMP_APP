import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { pick, errorCodes, isErrorWithCode, types } from '@react-native-documents/picker';
import { City, Country } from 'country-state-city';
import Feather from 'react-native-vector-icons/Feather';
import { loadTransportProfile, saveTransportProfile, uploadDocument, type TransportProfileView } from '../api';
import { getScreenCopy } from '../screenCopy';
import { type LiveData } from '../types';
import { Card, EmptyState, Input, PrimaryButton, SecondaryButton, styles } from '../ui';
import { t, type Locale } from '../i18n';

type Draft = Omit<TransportProfileView, 'id' | 'ownerEmail' | 'ownerName' | 'createdAt' | 'updatedAt'>;

type Assets = {
  permitUrl: string;
  registrationUrl: string;
  driverLicenseUrl: string;
  vehicleImageUrl: string;
};

type Option = { key: string; label: string };

const emptyDraft = (): Draft => ({
  providerType: 'Taxi',
  displayName: '',
  driverName: '',
  vehicleLabel: '',
  vehiclePlate: '',
  city: '',
  country: '',
  zone: '',
  permitUrl: '',
  registrationUrl: '',
  driverLicenseUrl: '',
  vehicleImageUrl: '',
  notes: '',
  publicNotes: '',
  active: true,
});

const emptyAssets: Assets = {
  permitUrl: '',
  registrationUrl: '',
  driverLicenseUrl: '',
  vehicleImageUrl: '',
};

const allCountries: Option[] = Country.getAllCountries().map((country) => ({
  key: country.isoCode,
  label: country.name,
}));

function resolveCountryCode(countryName: string) {
  const value = countryName.trim().toLowerCase();
  const match = allCountries.find((item) => item.label.toLowerCase() === value);
  return match?.key ?? '';
}

function SearchableDropdown({
  label,
  placeholder,
  value,
  options,
  searchPlaceholder,
  emptyLabel,
  disabled = false,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: Option[];
  searchPlaceholder: string;
  emptyLabel: string;
  disabled?: boolean;
  onSelect: (option: Option) => void;
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
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[screenStyles.dropdownButton, disabled && screenStyles.dropdownButtonDisabled]}
      >
        <View style={screenStyles.dropdownTextBlock}>
          <Text style={screenStyles.dropdownLabel}>{label}</Text>
          <Text style={[screenStyles.dropdownValue, !value && screenStyles.dropdownPlaceholder]} numberOfLines={1}>
            {value || placeholder}
          </Text>
        </View>
        <Feather name="chevron-down" size={18} color={disabled ? '#94a3b8' : '#2457e6'} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={screenStyles.modalBackdrop}>
          <Pressable style={screenStyles.modalBackdropPress} onPress={() => setOpen(false)} />
          <View style={screenStyles.modalSheet}>
            <Text style={screenStyles.modalTitle}>{label}</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor="#94a3b8"
              style={screenStyles.modalSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <ScrollView style={screenStyles.modalList} keyboardShouldPersistTaps="handled">
              {filtered.length ? filtered.map((option) => (
                <Pressable
                  key={option.key}
                  style={screenStyles.modalOption}
                  onPress={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Text style={screenStyles.modalOptionText}>{option.label}</Text>
                  {value === option.label ? <Feather name="check" size={16} color="#2457e6" /> : null}
                </Pressable>
              )) : (
                <Text style={screenStyles.modalEmpty}>{emptyLabel}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function ProfileScreen({ data, loading, locale }: { data: LiveData | null; loading: boolean; locale: Locale }) {
  const copy = getScreenCopy(locale).profile;
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  const [assets, setAssets] = useState<Assets>(emptyAssets);
  const [scanText, setScanText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<keyof Assets | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [countryCode, setCountryCode] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await loadTransportProfile();
        if (!mounted) return;
        const nextCountryCode = resolveCountryCode(profile.country || '');
        setDraft({
          providerType: profile.providerType || 'Taxi',
          displayName: profile.displayName || '',
          driverName: profile.driverName || '',
          vehicleLabel: profile.vehicleLabel || '',
          vehiclePlate: profile.vehiclePlate || '',
          city: profile.city || '',
          country: profile.country || '',
          zone: '',
          permitUrl: profile.permitUrl || '',
          registrationUrl: profile.registrationUrl || '',
          driverLicenseUrl: profile.driverLicenseUrl || '',
          vehicleImageUrl: profile.vehicleImageUrl || '',
          notes: profile.notes || '',
          publicNotes: profile.publicNotes || '',
          active: profile.active,
        });
        setCountryCode(nextCountryCode);
        setAssets({
          permitUrl: profile.permitUrl || '',
          registrationUrl: profile.registrationUrl || '',
          driverLicenseUrl: profile.driverLicenseUrl || '',
          vehicleImageUrl: profile.vehicleImageUrl || '',
        });
      } catch {
        // keep empty form when no profile exists yet
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentMatch = useMemo(() => data?.events?.[0] ?? null, [data]);
  const cityOptions = useMemo(() => {
    if (!countryCode) return [];
    return (City.getCitiesOfCountry(countryCode) ?? []).map((city) => ({ key: city.name, label: city.name }));
  }, [countryCode]);

  const countryValue = draft.country;
  const cityValue = draft.city;

  const update = (key: keyof Draft, value: string | boolean) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const parseScanText = () => {
    const text = scanText.trim();
    if (!text) {
      setError(t(locale, 'profile.scanFirst'));
      return;
    }
    const getValue = (patterns: RegExp[]) => {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1]) return match[1].trim();
      }
      return '';
    };
    setDraft((current) => ({
      ...current,
      displayName: getValue([/operator\s*[:-]\s*(.+)/i, /company\s*[:-]\s*(.+)/i]) || current.displayName,
      driverName: getValue([/driver\s*name\s*[:-]\s*(.+)/i, /name\s*[:-]\s*(.+)/i]) || current.driverName,
      vehicleLabel: getValue([/vehicle\s*[:-]\s*(.+)/i, /car\s*[:-]\s*(.+)/i]) || current.vehicleLabel,
      vehiclePlate: getValue([/plate\s*[:-]\s*([A-Z0-9\s-]+)/i, /reg\.?\s*[:-]\s*([A-Z0-9\s-]+)/i]) || current.vehiclePlate,
      city: getValue([/city\s*[:-]\s*(.+)/i]) || current.city,
      country: getValue([/country\s*[:-]\s*(.+)/i]) || current.country,
      notes: current.notes || '',
    }));
    setMessage(t(locale, 'profile.scanFilled'));
    setError(null);
  };

  const pickAndUpload = async (key: keyof Assets) => {
    setUploadingKey(key);
    setMessage(null);
    setError(null);
    try {
      const [file] = await pick({
        allowMultiSelection: false,
        presentationStyle: 'fullScreen',
        type: [types.images, types.pdf, types.allFiles],
        mode: 'import',
      });
      const uri = file.uri;
      if (!uri) throw new Error('Missing file URI');
      const uploaded = await uploadDocument({ uri, name: file.name ?? `${key}.bin`, type: file.type ?? 'application/octet-stream' });
      setAssets((current) => ({ ...current, [key]: uploaded.url }));
      setDraft((current) => ({ ...current, [key]: uploaded.url }));
      setMessage(t(locale, 'profile.documentUploaded'));
    } catch (caught: any) {
      if (isErrorWithCode(caught) && caught.code === errorCodes.OPERATION_CANCELED) {
        setMessage(t(locale, 'profile.selectionCancelled'));
      } else {
        setError(caught?.message ?? t(locale, 'profile.uploadFailed'));
      }
    } finally {
      setUploadingKey(null);
    }
  };

  const submit = async () => {
    if (!draft.displayName || !draft.driverName || !draft.vehiclePlate) {
      setError(t(locale, 'profile.completeRequired'));
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveTransportProfile({ ...draft, zone: '' });
      setMessage(t(locale, 'profile.driverSaved'));
      setShowDriverForm(false);
    } catch (caught: any) {
      setError(caught?.message ?? t(locale, 'profile.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <Card title={copy.profileTitle} subtitle={copy.profileSubtitle} wide>
          <View style={screenStyles.rowGap}>
            <Text style={styles.muted}>{copy.profileBody}</Text>
            <Pressable
              onPress={() => setShowDriverForm((value) => !value)}
              style={showDriverForm ? screenStyles.primaryToggleActive : screenStyles.primaryToggle}
            >
              <Feather name="user-plus" size={16} color={showDriverForm ? '#172033' : '#2457e6'} />
              <Text style={showDriverForm ? screenStyles.primaryToggleTextActive : screenStyles.primaryToggleText}>
                {showDriverForm ? t(locale, 'profile.closeDriverForm') : t(locale, 'profile.registerDriver')}
              </Text>
            </Pressable>
            <Text style={styles.helperText}>{showDriverForm ? t(locale, 'profile.driverFormHint') : t(locale, 'profile.driverFormPrompt')}</Text>
          </View>
        </Card>

        {showDriverForm ? (
          <>
            <Card title={t(locale, 'profile.driverFormTitle')} subtitle={t(locale, 'profile.driverFormSubtitle')} wide>
              <View style={screenStyles.rowGap}>
                {loadingProfile ? <EmptyState icon="time-outline" title={copy.loadingTitle} subtitle={copy.loadingBody} /> : null}
                <View style={styles.chipsRow}>
                  {['Taxi', 'VTC', 'Shuttle'].map((type) => (
                    <Pressable key={type} style={[styles.tabChip, draft.providerType === type && styles.tabChipActive]} onPress={() => update('providerType', type)}>
                      <Text style={[styles.tabChipText, draft.providerType === type && styles.tabChipTextActive]}>{type}</Text>
                    </Pressable>
                  ))}
                </View>
                <Input value={draft.displayName} onChangeText={(value) => update('displayName', value)} placeholder={t(locale, 'profile.displayName')} />
                <Input value={draft.driverName} onChangeText={(value) => update('driverName', value)} placeholder={t(locale, 'profile.driverName')} />
                <Input value={draft.vehicleLabel} onChangeText={(value) => update('vehicleLabel', value)} placeholder={t(locale, 'profile.vehicleLabel')} />
                <Input value={draft.vehiclePlate} onChangeText={(value) => update('vehiclePlate', value)} placeholder={t(locale, 'profile.vehiclePlate')} autoCapitalize="characters" />
                <SearchableDropdown
                  label={t(locale, 'auth.country')}
                  placeholder={t(locale, 'profile.countryPlaceholder')}
                  value={countryValue}
                  options={allCountries}
                  searchPlaceholder={t(locale, 'profile.countrySearch')}
                  emptyLabel={t(locale, 'profile.noSearchResults')}
                  onSelect={(option) => {
                    setCountryCode(option.key);
                    update('country', option.label);
                    update('city', '');
                  }}
                />
                <SearchableDropdown
                  label={t(locale, 'auth.city')}
                  placeholder={countryCode ? t(locale, 'profile.cityPlaceholder') : t(locale, 'profile.chooseCountryFirst')}
                  value={cityValue}
                  options={cityOptions}
                  searchPlaceholder={t(locale, 'profile.citySearch')}
                  emptyLabel={t(locale, 'profile.noCitiesAvailable')}
                  disabled={!countryCode}
                  onSelect={(option) => update('city', option.label)}
                />
                <Text style={styles.helperText}>{t(locale, 'profile.countryHint')}</Text>
                <Text style={styles.helperText}>{t(locale, 'profile.cityHint')}</Text>
              </View>
            </Card>

            <Card title={t(locale, 'profile.securityDocsTitle')} subtitle={t(locale, 'profile.securityDocsSubtitle')}>
              <View style={screenStyles.rowGap}>
                <Text style={styles.helperText}>{t(locale, 'profile.scanHint')}</Text>
                <ActionRow label={uploadingKey === 'driverLicenseUrl' ? t(locale, 'profile.uploading') : t(locale, 'profile.uploadDriverLicense')} onPress={() => pickAndUpload('driverLicenseUrl')} accent={!!assets.driverLicenseUrl} />
                <ActionRow label={uploadingKey === 'registrationUrl' ? t(locale, 'profile.uploading') : t(locale, 'profile.uploadRegistration')} onPress={() => pickAndUpload('registrationUrl')} accent={!!assets.registrationUrl} />
                <ActionRow label={uploadingKey === 'permitUrl' ? t(locale, 'profile.uploading') : t(locale, 'profile.uploadPermit')} onPress={() => pickAndUpload('permitUrl')} accent={!!assets.permitUrl} />
                <ActionRow label={uploadingKey === 'vehicleImageUrl' ? t(locale, 'profile.uploading') : t(locale, 'profile.uploadVehicleImage')} onPress={() => pickAndUpload('vehicleImageUrl')} accent={!!assets.vehicleImageUrl} />
                <TextInput
                  value={scanText}
                  onChangeText={setScanText}
                  placeholder={t(locale, 'profile.scanPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={5}
                  style={screenStyles.textArea}
                />
                <SecondaryButton label={t(locale, 'profile.autofillScan')} onPress={parseScanText} icon={<Feather name="cpu" size={16} color="#172033" />} />
              </View>
            </Card>

            <Card title={t(locale, 'profile.visibilityTitle')} subtitle={t(locale, 'profile.visibilitySubtitle')}>
              <View style={screenStyles.rowGap}>
                <Text style={styles.helperText}>{t(locale, 'profile.visibilityBody')}</Text>
                <Pressable onPress={() => update('active', !draft.active)} style={[screenStyles.toggle, draft.active && screenStyles.toggleActive]}>
                  <Text style={[screenStyles.toggleText, draft.active && screenStyles.toggleTextActive]}>{draft.active ? t(locale, 'common.visible') : t(locale, 'common.hidden')}</Text>
                </Pressable>
                {currentMatch ? <Text style={styles.helperText}>{t(locale, 'profile.currentMatch')}: {currentMatch.title}</Text> : null}
                <TextInput
                  value={draft.notes}
                  onChangeText={(value) => update('notes', value)}
                  placeholder={t(locale, 'profile.internalNotes')}
                  placeholderTextColor="#94a3b8"
                  multiline
                  style={screenStyles.textArea}
                />
                <TextInput
                  value={draft.publicNotes}
                  onChangeText={(value) => update('publicNotes', value)}
                  placeholder={t(locale, 'profile.publicNotes')}
                  placeholderTextColor="#94a3b8"
                  multiline
                  style={screenStyles.textArea}
                />
              </View>
            </Card>

            <Card title={t(locale, 'profile.validationTitle')} subtitle={t(locale, 'profile.validationSubtitle')} wide>
              <View style={screenStyles.rowGap}>
                <View style={screenStyles.ctaRow}>
                  <PrimaryButton label={saving ? t(locale, 'profile.savingDriverProfile') : t(locale, 'profile.saveDriverProfile')} onPress={submit} icon={saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />} />
                </View>
                {message ? <Text style={screenStyles.success}>{message}</Text> : null}
                {error ? <Text style={screenStyles.error}>{error}</Text> : null}
              </View>
            </Card>
          </>
        ) : null}

        <Card title={copy.historyTitle} subtitle={copy.historySubtitle}>
          {data ? data.events.map((item) => <Text key={item.id} style={styles.helperText}>{item.title} · {item.city}</Text>) : loading ? <EmptyState icon="time-outline" title={copy.loadingTitle} subtitle={copy.loadingBody} /> : <EmptyState icon="person-outline" title={copy.emptyTitle} subtitle={copy.emptyBody} />}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionRow({ label, onPress, accent }: { label: string; onPress: () => void; accent: boolean }) {
  return (
    <Pressable onPress={onPress} style={[screenStyles.actionRow, accent && screenStyles.actionRowActive]}>
      <Text style={[screenStyles.actionRowText, accent && screenStyles.actionRowTextActive]}>{label}</Text>
      <Feather name="upload" size={16} color={accent ? '#172033' : '#2457e6'} />
    </Pressable>
  );
}

const screenStyles = StyleSheet.create({
  rowGap: { gap: 12 },
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dce5f5',
  },
  primaryToggleActive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#e8f7bf', borderWidth: 1, borderColor: '#c8f36a' },
  primaryToggleText: { color: '#2457e6', fontFamily: 'Poppins-SemiBold' },
  primaryToggleTextActive: { color: '#172033', fontFamily: 'Poppins-SemiBold' },
  dropdownButton: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dce5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownButtonDisabled: { opacity: 0.7 },
  dropdownTextBlock: { flex: 1, gap: 2 },
  dropdownLabel: { color: '#60708b', fontFamily: 'Poppins-SemiBold', fontSize: 12, textTransform: 'uppercase' },
  dropdownValue: { color: '#172033', fontFamily: 'Poppins-SemiBold' },
  dropdownPlaceholder: { color: '#94a3b8' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(16,27,45,0.45)', justifyContent: 'flex-end' },
  modalBackdropPress: { ...StyleSheet.absoluteFill },
  modalSheet: { backgroundColor: '#f6f8fc', padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '78%' },
  modalTitle: { color: '#172033', fontSize: 18, fontFamily: 'Poppins-Bold', marginBottom: 10 },
  modalSearch: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#dce5f5', color: '#172033', paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Poppins-Regular', marginBottom: 12 },
  modalList: { maxHeight: 360 },
  modalOption: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e6eaf0', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  modalOptionText: { color: '#172033', fontFamily: 'Poppins-SemiBold', flex: 1 },
  modalEmpty: { color: '#60708b', fontFamily: 'Poppins-Medium', paddingVertical: 12 },
  textArea: {
    minHeight: 108,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dce5f5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#172033',
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top',
  },
  actionRow: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dce5f5',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionRowActive: { backgroundColor: '#e8f7bf', borderColor: '#c8f36a' },
  actionRowText: { color: '#172033', fontFamily: 'Poppins-SemiBold', flex: 1, paddingRight: 12 },
  actionRowTextActive: { color: '#172033' },
  toggle: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce5f5', alignItems: 'center' },
  toggleActive: { backgroundColor: '#e8f7bf', borderColor: '#c8f36a' },
  toggleText: { color: '#172033', fontFamily: 'Poppins-SemiBold' },
  toggleTextActive: { color: '#172033' },
  ctaRow: { flexDirection: 'row', gap: 12 },
  success: { color: '#14532d', fontFamily: 'Poppins-Medium' },
  error: { color: '#b42318', fontFamily: 'Poppins-Medium' },
});
