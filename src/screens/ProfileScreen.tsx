import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Feather from 'react-native-vector-icons/Feather';
import { loadTransportProfile, saveTransportProfile, uploadDocument, type TransportProfileView } from '../api';
import { getScreenCopy } from '../screenCopy';
import { type LiveData } from '../types';
import { Card, EmptyState, Input, PrimaryButton, SecondaryButton, styles } from '../ui';
import type { Locale } from '../i18n';

type Draft = Omit<TransportProfileView, 'id' | 'ownerEmail' | 'ownerName' | 'createdAt' | 'updatedAt'>;

type Assets = {
  permitUrl: string;
  registrationUrl: string;
  driverLicenseUrl: string;
  vehicleImageUrl: string;
};

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
  publicNotes: 'Visible to fans when available for the match.',
  active: true,
});

const emptyAssets: Assets = {
  permitUrl: '',
  registrationUrl: '',
  driverLicenseUrl: '',
  vehicleImageUrl: '',
};

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await loadTransportProfile();
        if (!mounted) return;
        setDraft({
          providerType: profile.providerType || 'Taxi',
          displayName: profile.displayName || '',
          driverName: profile.driverName || '',
          vehicleLabel: profile.vehicleLabel || '',
          vehiclePlate: profile.vehiclePlate || '',
          city: profile.city || '',
          country: profile.country || '',
          zone: profile.zone || '',
          permitUrl: profile.permitUrl || '',
          registrationUrl: profile.registrationUrl || '',
          driverLicenseUrl: profile.driverLicenseUrl || '',
          vehicleImageUrl: profile.vehicleImageUrl || '',
          notes: profile.notes || '',
          publicNotes: profile.publicNotes || '',
          active: profile.active,
        });
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

  const update = (key: keyof Draft, value: string | boolean) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const parseScanText = () => {
    const text = scanText.trim();
    if (!text) {
      setError('Colle le texte OCR ou les infos extraites du document avant l’autoremplissage.');
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
      zone: getValue([/zone\s*[:-]\s*(.+)/i, /area\s*[:-]\s*(.+)/i]) || current.zone,
      notes: current.notes || 'Autofilled from scan data.',
    }));
    setMessage('Les champs détectés ont été pré-remplis. Vérifie puis valide.');
    setError(null);
  };

  const pickAndUpload = async (key: keyof Assets) => {
    setUploadingKey(key);
    setMessage(null);
    setError(null);
    try {
      const file = await DocumentPicker.pickSingle({
        allowMultiSelection: false,
        presentationStyle: 'fullScreen',
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf, DocumentPicker.types.allFiles],
      });
      const uri = file.fileCopyUri ?? file.uri;
      if (!uri) throw new Error('Missing file URI');
      const uploaded = await uploadDocument({ uri, name: file.name ?? `${key}.bin`, type: file.type ?? 'application/octet-stream' });
      setAssets((current) => ({ ...current, [key]: uploaded.url }));
      setDraft((current) => ({ ...current, [key]: uploaded.url }));
      setMessage(`Document chargé: ${file.name ?? key}.`);
    } catch (caught: any) {
      if (DocumentPicker.isCancel(caught)) {
        setMessage('Sélection de fichier annulée.');
      } else {
        setError(caught?.message ?? 'Upload impossible.');
      }
    } finally {
      setUploadingKey(null);
    }
  };

  const submit = async () => {
    if (!draft.displayName || !draft.driverName || !draft.vehiclePlate) {
      setError('Complète le nom affiché, le chauffeur et la plaque avant validation.');
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveTransportProfile(draft);
      setMessage('Profil chauffeur enregistré. Tu pourras ensuite te déclarer disponible pour chaque match dans l’onglet Transport.');
    } catch (caught: any) {
      setError(caught?.message ?? 'Impossible d’enregistrer le profil.');
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

        <Card title="Profil chauffeur" subtitle="Votre identité et véhicule">
          <View style={screenStyles.rowGap}>
            {loadingProfile ? <EmptyState icon="time-outline" title="Chargement du profil" subtitle="Lecture du profil transport en cours." /> : null}
            <View style={styles.chipsRow}>
              {['Taxi', 'VTC', 'Shuttle'].map((type) => (
                <Pressable key={type} style={[styles.tabChip, draft.providerType === type && styles.tabChipActive]} onPress={() => update('providerType', type)}>
                  <Text style={[styles.tabChipText, draft.providerType === type && styles.tabChipTextActive]}>{type}</Text>
                </Pressable>
              ))}
            </View>
            <Input value={draft.displayName} onChangeText={(value) => update('displayName', value)} placeholder="Nom public de l’opérateur" />
            <Input value={draft.driverName} onChangeText={(value) => update('driverName', value)} placeholder="Nom du chauffeur" />
            <Input value={draft.vehicleLabel} onChangeText={(value) => update('vehicleLabel', value)} placeholder="Modèle / véhicule" />
            <Input value={draft.vehiclePlate} onChangeText={(value) => update('vehiclePlate', value)} placeholder="Plaque du véhicule" autoCapitalize="characters" />
            <Input value={draft.city} onChangeText={(value) => update('city', value)} placeholder="Ville" />
            <Input value={draft.country} onChangeText={(value) => update('country', value)} placeholder="Pays" />
            <Input value={draft.zone} onChangeText={(value) => update('zone', value)} placeholder="Zone / point de prise en charge" />
          </View>
        </Card>

        <Card title="Documents sécurité" subtitle="Upload + scan">
          <View style={screenStyles.rowGap}>
            <Text style={styles.helperText}>Tu peux charger les documents, puis coller le texte OCR pour autoremplir les champs sensibles.</Text>
            <ActionRow label={uploadingKey === 'driverLicenseUrl' ? 'Upload...' : 'Carte de permis'} onPress={() => pickAndUpload('driverLicenseUrl')} accent={!!assets.driverLicenseUrl} />
            <ActionRow label={uploadingKey === 'registrationUrl' ? 'Upload...' : 'Carte grise'} onPress={() => pickAndUpload('registrationUrl')} accent={!!assets.registrationUrl} />
            <ActionRow label={uploadingKey === 'permitUrl' ? 'Upload...' : 'Autorisation / licence'} onPress={() => pickAndUpload('permitUrl')} accent={!!assets.permitUrl} />
            <ActionRow label={uploadingKey === 'vehicleImageUrl' ? 'Upload...' : 'Photo du véhicule'} onPress={() => pickAndUpload('vehicleImageUrl')} accent={!!assets.vehicleImageUrl} />
            <TextInput
              value={scanText}
              onChangeText={setScanText}
              placeholder="Texte OCR / scan du document"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={5}
              style={screenStyles.textArea}
            />
            <SecondaryButton label="Autoremplir depuis le scan" onPress={parseScanText} icon={<Feather name="cpu" size={16} color="#172033" />} />
          </View>
        </Card>

        <Card title="Visibilité" subtitle="Contrôle fan + match">
          <View style={screenStyles.rowGap}>
            <Text style={styles.helperText}>Le profil est global. Ensuite, dans l’onglet Transport, tu choisis le match où tu es disponible et prêt ou non.</Text>
            <Pressable onPress={() => update('active', !draft.active)} style={[screenStyles.toggle, draft.active && screenStyles.toggleActive]}>
              <Text style={[screenStyles.toggleText, draft.active && screenStyles.toggleTextActive]}>{draft.active ? 'Profil visible' : 'Profil en attente'}</Text>
            </Pressable>
            {currentMatch ? <Text style={styles.helperText}>Match actuel: {currentMatch.title}</Text> : null}
            <TextInput
              value={draft.notes}
              onChangeText={(value) => update('notes', value)}
              placeholder="Notes internes"
              placeholderTextColor="#94a3b8"
              multiline
              style={screenStyles.textArea}
            />
            <TextInput
              value={draft.publicNotes}
              onChangeText={(value) => update('publicNotes', value)}
              placeholder="Message public pour les fans"
              placeholderTextColor="#94a3b8"
              multiline
              style={screenStyles.textArea}
            />
          </View>
        </Card>

        <Card title="Validation" subtitle="Enregistrement backend" wide>
          <View style={screenStyles.rowGap}>
            <View style={screenStyles.ctaRow}>
              <PrimaryButton label={saving ? 'Validation...' : 'Enregistrer le profil chauffeur'} onPress={submit} icon={saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />} />
            </View>
            {message ? <Text style={screenStyles.success}>{message}</Text> : null}
            {error ? <Text style={screenStyles.error}>{error}</Text> : null}
          </View>
        </Card>

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
