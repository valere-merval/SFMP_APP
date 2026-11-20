import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Feather from 'react-native-vector-icons/Feather';
import { uploadDocument, postJson } from '../api';
import { type LiveData, type TransportProviderView } from '../types';
import { Card, EmptyState, Input, PrimaryButton, Row, SecondaryButton, styles as uiStyles } from '../ui';

const transportTypes = ['Taxi', 'VTC', 'Shuttle', 'Bus', 'Train'] as const;
const statusOptions = ['pending', 'review', 'active', 'paused'] as const;

type Draft = {
  matchId: string;
  providerType: string;
  displayName: string;
  driverName: string;
  vehicleLabel: string;
  vehiclePlate: string;
  city: string;
  country: string;
  zone: string;
  status: string;
  active: boolean;
  notes: string;
  publicNotes: string;
};

type UploadedAssets = {
  permitUrl: string;
  registrationUrl: string;
  driverLicenseUrl: string;
  vehicleImageUrl: string;
};

const emptyDraft = (matchId = ''): Draft => ({
  matchId,
  providerType: 'Taxi',
  displayName: '',
  driverName: '',
  vehicleLabel: '',
  vehiclePlate: '',
  city: '',
  country: '',
  zone: '',
  status: 'pending',
  active: true,
  notes: '',
  publicNotes: 'Verified operator for matchday pickup and drop-off.',
});

const emptyAssets: UploadedAssets = {
  permitUrl: '',
  registrationUrl: '',
  driverLicenseUrl: '',
  vehicleImageUrl: '',
};

export function TransportScreen({
  data,
  loading,
  onReload,
}: {
  data: LiveData | null;
  loading: boolean;
  onReload: () => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  const [assets, setAssets] = useState<UploadedAssets>(emptyAssets);
  const [scanText, setScanText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<keyof UploadedAssets | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => data?.matches ?? [], [data?.matches]);
  const providers = useMemo(() => data?.transportProviders ?? [], [data?.transportProviders]);

  const selectedMatch = useMemo(() => matches.find((item) => item.id === draft.matchId) ?? null, [draft.matchId, matches]);
  const activeProviders = useMemo(
    () => providers.filter((provider) => provider.matchId === draft.matchId || !draft.matchId || provider.active),
    [draft.matchId, providers],
  );

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
        if (match?.[1]) {
          return match[1].trim();
        }
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

  const pickAndUpload = async (key: keyof UploadedAssets) => {
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
      if (!uri) {
        throw new Error('Missing file URI');
      }
      const uploaded = await uploadDocument({
        uri,
        name: file.name ?? `${key}.bin`,
        type: file.type ?? 'application/octet-stream',
      });
      setAssets((current) => ({ ...current, [key]: uploaded.url }));
      setMessage(`Document chargé: ${file.name ?? key}.`);
    } catch (nextError: any) {
      if (DocumentPicker.isCancel(nextError)) {
        setMessage('Sélection de fichier annulée.');
      } else {
        setError(nextError?.message ?? 'Upload impossible.');
      }
    } finally {
      setUploadingKey(null);
    }
  };

  const submit = async () => {
    if (!draft.matchId) {
      setError('Choisis d’abord le match pour lequel le chauffeur ou le VTC est disponible.');
      return;
    }

    if (!draft.displayName || !draft.driverName || !draft.vehiclePlate) {
      setError('Complète le nom affiché, le chauffeur et la plaque avant validation.');
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await postJson('/api/v1/transport-providers', {
        matchId: draft.matchId,
        providerType: draft.providerType,
        displayName: draft.displayName,
        driverName: draft.driverName,
        vehicleLabel: draft.vehicleLabel,
        vehiclePlate: draft.vehiclePlate,
        city: draft.city,
        country: draft.country,
        zone: draft.zone,
        status: draft.status,
        active: draft.active,
        permitUrl: assets.permitUrl,
        registrationUrl: assets.registrationUrl,
        driverLicenseUrl: assets.driverLicenseUrl,
        vehicleImageUrl: assets.vehicleImageUrl,
        notes: draft.notes,
        publicNotes: draft.publicNotes,
      });
      setMessage('Transport enregistré et visible pour le match sélectionné.');
      setDraft((current) => ({ ...current, status: 'review' }));
      await onReload();
    } catch (nextError: any) {
      setError(nextError?.message ?? 'Impossible d’enregistrer le transport.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={screenStyles.screen} contentContainerStyle={screenStyles.container} showsVerticalScrollIndicator={false}>
      <View style={screenStyles.hero}>
        <Text style={screenStyles.kicker}>TRANSPORTS</Text>
        <Text style={screenStyles.title}>Taxi / VTC onboarding</Text>
        <Text style={screenStyles.subtitle}>Les chauffeurs créent leur profil directement dans l’app, uploadent leurs documents, puis deviennent visibles pour les fans sur le match choisi.</Text>
      </View>

      <Card title="Match cible" subtitle="Sélection événement" wide>
        {matches.length ? (
          <View style={uiStyles.chipsRow}>
            {matches.map((match) => (
              <Pressable
                key={match.id}
                onPress={() => update('matchId', match.id)}
                style={[uiStyles.tabChip, draft.matchId === match.id && uiStyles.tabChipActive]}
              >
                <Text style={[uiStyles.tabChipText, draft.matchId === match.id && uiStyles.tabChipTextActive]}>
                  {match.homeTeam} vs {match.awayTeam}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : loading ? (
          <EmptyState icon="loader-outline" title="Chargement du catalogue" subtitle="Les matchs sont en cours de chargement." />
        ) : (
          <EmptyState icon="calendar-outline" title="Aucun match disponible" subtitle="Recharge le catalogue backend pour enregistrer un transport." />
        )}
        {selectedMatch ? (
          <Text style={uiStyles.helperText}>Sélection active: {selectedMatch.homeTeam} vs {selectedMatch.awayTeam} · {selectedMatch.city}</Text>
        ) : null}
      </Card>

      <Card title="Identité opérateur" subtitle="Données principales">
        <View style={screenStyles.rowGap}>
          <View style={uiStyles.chipsRow}>
            {transportTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => update('providerType', type)}
                style={[uiStyles.langChip, draft.providerType === type && uiStyles.langChipActive]}
              >
                <Text style={[uiStyles.langChipText, draft.providerType === type && uiStyles.langChipTextActive]}>{type}</Text>
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
          <Text style={uiStyles.helperText}>Tu peux charger les documents, puis coller le texte OCR pour autoremplir les champs sensibles.</Text>
          <ActionRow
            label={uploadingKey === 'driverLicenseUrl' ? 'Upload...' : draft.driverName ? 'Carte de permis' : 'Carte de permis'}
            onPress={() => pickAndUpload('driverLicenseUrl')}
            accent={!!assets.driverLicenseUrl}
          />
          <ActionRow
            label={uploadingKey === 'registrationUrl' ? 'Upload...' : 'Carte grise'}
            onPress={() => pickAndUpload('registrationUrl')}
            accent={!!assets.registrationUrl}
          />
          <ActionRow
            label={uploadingKey === 'permitUrl' ? 'Upload...' : 'Autorisation / licence'}
            onPress={() => pickAndUpload('permitUrl')}
            accent={!!assets.permitUrl}
          />
          <ActionRow
            label={uploadingKey === 'vehicleImageUrl' ? 'Upload...' : 'Photo du véhicule'}
            onPress={() => pickAndUpload('vehicleImageUrl')}
            accent={!!assets.vehicleImageUrl}
          />
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

      <Card title="Disponibilité" subtitle="Visible pour les fans">
        <View style={screenStyles.rowGap}>
          <Row leftTitle="Statut" leftSubtitle={draft.status} rightTitle={draft.active ? 'Actif' : 'Inactif'} rightSubtitle="Matchday" />
          <View style={uiStyles.chipsRow}>
            {statusOptions.map((status) => (
              <Pressable
                key={status}
                onPress={() => update('status', status)}
                style={[uiStyles.tabChip, draft.status === status && uiStyles.tabChipActive]}
              >
                <Text style={[uiStyles.tabChipText, draft.status === status && uiStyles.tabChipTextActive]}>{status}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => update('active', !draft.active)} style={[screenStyles.toggle, draft.active && screenStyles.toggleActive]}>
            <Text style={[screenStyles.toggleText, draft.active && screenStyles.toggleTextActive]}>{draft.active ? 'Disponible pour ce match' : 'Mettre en attente'}</Text>
          </Pressable>
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
          <Text style={uiStyles.helperText}>Les liens des documents sont stockés en base, et les fans verront seulement le chauffeur, le véhicule et le statut de disponibilité.</Text>
          <View style={screenStyles.ctaRow}>
            <PrimaryButton label={saving ? 'Validation...' : 'Enregistrer le transport'} onPress={submit} icon={saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />} />
            <SecondaryButton label="Ouvrir le match" onPress={() => selectedMatch && Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(selectedMatch.venue + ', ' + selectedMatch.city + ', ' + selectedMatch.country)}`)} icon={<Feather name="map" size={16} color="#172033" />} />
          </View>
          {message ? <Text style={screenStyles.success}>{message}</Text> : null}
          {error ? <Text style={screenStyles.error}>{error}</Text> : null}
        </View>
      </Card>

      <Card title="Opérateurs visibles" subtitle="Live backend list" wide>
        {activeProviders.length ? (
          activeProviders.map((provider: TransportProviderView) => (
            <View key={provider.id} style={screenStyles.providerCard}>
              <View style={screenStyles.providerTop}>
                <View style={screenStyles.providerBadge}>
                  <Feather name="truck" size={14} color="#172033" />
                  <Text style={screenStyles.providerBadgeText}>{provider.providerType}</Text>
                </View>
                <Text style={screenStyles.providerStatus}>{provider.status}</Text>
              </View>
              <Text style={screenStyles.providerTitle}>{provider.displayName}</Text>
              <Text style={screenStyles.providerBody}>{provider.matchTitle}</Text>
              <Text style={screenStyles.providerBody}>{provider.vehicleLabel}</Text>
              <Text style={screenStyles.providerBody}>{provider.city} · {provider.country} · {provider.zone}</Text>
            </View>
          ))
        ) : (
          <EmptyState icon="car-outline" title="Aucun transport enregistré" subtitle="Les chauffeurs et VTC apparaîtront ici dès qu’ils s’enregistrent pour le match." />
        )}
      </Card>
    </ScrollView>
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
  screen: { flex: 1, backgroundColor: '#f6f8fc' },
  container: { padding: 18, gap: 14, backgroundColor: '#f6f8fc', paddingBottom: 28 },
  hero: { backgroundColor: '#101b2d', borderRadius: 24, padding: 20, gap: 10, borderTopWidth: 4, borderTopColor: '#c8f36a' },
  kicker: { color: '#c8f36a', letterSpacing: 1.2, fontSize: 12, fontFamily: 'Poppins-Bold' },
  title: { color: '#fff', fontSize: 30, lineHeight: 36, fontFamily: 'Poppins-ExtraBold' },
  subtitle: { color: '#d4def0', fontSize: 15, lineHeight: 22, fontFamily: 'Poppins-Regular' },
  rowGap: { gap: 12 },
  textArea: {
    minHeight: 108,
    borderWidth: 1,
    borderColor: '#dbe4ff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    color: '#172033',
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top',
  },
  actionRow: {
    borderWidth: 1,
    borderColor: '#dbe4ff',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRowActive: { backgroundColor: '#d7ff2f', borderColor: '#d7ff2f' },
  actionRowText: { color: '#2457e6', fontFamily: 'Poppins-SemiBold' },
  actionRowTextActive: { color: '#172033' },
  toggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe4ff',
    backgroundColor: '#fff',
  },
  toggleActive: { backgroundColor: '#d7ff2f', borderColor: '#d7ff2f' },
  toggleText: { color: '#60708b', fontFamily: 'Poppins-SemiBold' },
  toggleTextActive: { color: '#172033' },
  ctaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  success: { color: '#0f7a3b', fontFamily: 'Poppins-SemiBold' },
  error: { color: '#b91c1c', fontFamily: 'Poppins-SemiBold' },
  providerCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e6eaf0',
    gap: 6,
  },
  providerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d7ff2f',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  providerBadgeText: { color: '#172033', fontFamily: 'Poppins-SemiBold', fontSize: 12 },
  providerStatus: { color: '#2457e6', fontFamily: 'Poppins-Bold', textTransform: 'uppercase', fontSize: 11 },
  providerTitle: { color: '#101b2d', fontSize: 16, fontFamily: 'Poppins-ExtraBold' },
  providerBody: { color: '#60708b', fontFamily: 'Poppins-Regular', lineHeight: 20 },
  providerNotes: { color: '#172033', fontFamily: 'Poppins-Medium', lineHeight: 20 },
});
