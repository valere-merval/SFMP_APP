import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { loadTransportAvailability, saveTransportAvailability, type TransportAvailabilityView } from '../api';
import { type LiveData, type TransportProviderView } from '../types';
import { Card, EmptyState, PrimaryButton, SecondaryButton, styles as uiStyles } from '../ui';

const statusOptions = ['Available', 'Busy', 'On route', 'Paused'] as const;

export function TransportScreen({
  data,
  loading,
  onReload,
}: {
  data: LiveData | null;
  loading: boolean;
  onReload: () => Promise<void> | void;
}) {
  const matches = useMemo(() => data?.matches ?? [], [data?.matches]);
  const providers = useMemo(() => data?.transportProviders ?? [], [data?.transportProviders]);
  const [matchId, setMatchId] = useState('');
  const [available, setAvailable] = useState(true);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('Available');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedAvailability, setLoadedAvailability] = useState<TransportAvailabilityView | null>(null);

  const selectedMatch = useMemo(() => matches.find((item) => item.id === matchId) ?? null, [matchId, matches]);
  const visibleProviders = useMemo(() => providers.filter((provider) => !matchId || provider.matchId === matchId), [matchId, providers]);

  useEffect(() => {
    let mounted = true;
    if (!matchId) return;
    (async () => {
      try {
        const availability = await loadTransportAvailability(matchId);
        if (!mounted) return;
        setLoadedAvailability(availability);
        setAvailable(availability.available);
        setReady(availability.ready);
        setStatus(availability.status || 'Available');
        setNotes(availability.notes || '');
      } catch {
        if (!mounted) return;
        setLoadedAvailability(null);
        setAvailable(true);
        setReady(false);
        setStatus('Available');
        setNotes('');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [matchId]);

  const submit = async () => {
    if (!matchId) {
      setError('Choisis d’abord un match pour déclarer ta disponibilité.');
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveTransportAvailability(matchId, { available, ready, status, notes });
      setMessage('Ta disponibilité est enregistrée pour ce match et les fans pourront te voir si tu es disponible.');
      await onReload();
    } catch (caught: any) {
      setError(caught?.message ?? 'Impossible d’enregistrer la disponibilité.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={screenStyles.screen}>
      <ScrollView contentContainerStyle={screenStyles.container} showsVerticalScrollIndicator={false}>
        <View style={screenStyles.hero}>
          <Text style={screenStyles.kicker}>TRANSPORT</Text>
          <Text style={screenStyles.title}>Match availability</Text>
          <Text style={screenStyles.subtitle}>Ton profil chauffeur se gère dans le profil utilisateur. Ici tu dis simplement si tu es disponible pour le match, puis prêt ou non le jour J.</Text>
        </View>

        <Card title="Match ciblé" subtitle="Choisis l’événement" wide>
          {matches.length ? (
            <View style={uiStyles.chipsRow}>
              {matches.map((match) => (
                <Pressable key={match.id} onPress={() => setMatchId(match.id)} style={[uiStyles.tabChip, matchId === match.id && uiStyles.tabChipActive]}>
                  <Text style={[uiStyles.tabChipText, matchId === match.id && uiStyles.tabChipTextActive]}>{match.homeTeam} vs {match.awayTeam}</Text>
                </Pressable>
              ))}
            </View>
          ) : loading ? (
            <EmptyState icon="loader-outline" title="Chargement du catalogue" subtitle="Les matchs sont en cours de chargement." />
          ) : (
            <EmptyState icon="calendar-outline" title="Aucun match disponible" subtitle="Recharge le catalogue backend." />
          )}
          {selectedMatch ? <Text style={uiStyles.helperText}>Sélection active: {selectedMatch.homeTeam} vs {selectedMatch.awayTeam} · {selectedMatch.city}</Text> : null}
        </Card>

        <Card title="Ma disponibilité" subtitle="Visible par les fans du match" wide>
          <View style={screenStyles.rowGap}>
            <Text style={uiStyles.helperText}>Le profil chauffeur/véhicule vient du profil utilisateur. Tu peux seulement basculer ici la disponibilité par match.</Text>
            <View style={uiStyles.chipsRow}>
              {statusOptions.map((item) => (
                <Pressable key={item} onPress={() => setStatus(item)} style={[uiStyles.langChip, status === item && uiStyles.langChipActive]}>
                  <Text style={[uiStyles.langChipText, status === item && uiStyles.langChipTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setAvailable((value) => !value)} style={[screenStyles.toggle, available && screenStyles.toggleActive]}>
              <Text style={[screenStyles.toggleText, available && screenStyles.toggleTextActive]}>{available ? 'Disponible pour ce match' : 'Non disponible'}</Text>
            </Pressable>
            <Pressable onPress={() => setReady((value) => !value)} style={[screenStyles.toggle, ready && screenStyles.toggleActive]}>
              <Text style={[screenStyles.toggleText, ready && screenStyles.toggleTextActive]}>{ready ? 'Prêt à prendre un passager' : 'Pas encore prêt'}</Text>
            </Pressable>
            <TextInput value={notes} onChangeText={setNotes} placeholder="Notes rapides / instruction de pickup" placeholderTextColor="#94a3b8" multiline style={screenStyles.textArea} />
            <View style={screenStyles.ctaRow}>
              <PrimaryButton label={saving ? 'Enregistrement...' : 'Sauver ma disponibilité'} onPress={submit} icon={saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />} />
              <SecondaryButton label="Rafraîchir" onPress={onReload} icon={<Feather name="refresh-cw" size={16} color="#172033" />} />
            </View>
            {message ? <Text style={screenStyles.success}>{message}</Text> : null}
            {error ? <Text style={screenStyles.error}>{error}</Text> : null}
            {loadedAvailability ? <Text style={uiStyles.helperText}>Dernier état: {loadedAvailability.status} · {loadedAvailability.available ? 'Visible' : 'Masqué'} · {loadedAvailability.ready ? 'Prêt' : 'Pas prêt'}</Text> : null}
          </View>
        </Card>

        <Card title="Chauffeurs visibles" subtitle="Fans du match" wide>
          {visibleProviders.length ? (
            visibleProviders.map((provider: TransportProviderView) => (
              <View key={provider.id} style={screenStyles.providerCard}>
                <View style={screenStyles.providerTop}>
                  <View style={screenStyles.providerBadge}>
                    <Feather name="truck" size={14} color="#172033" />
                    <Text style={screenStyles.providerBadgeText}>{provider.providerType}</Text>
                  </View>
                  <Text style={screenStyles.providerStatus}>{provider.active ? 'Visible' : 'Paused'}</Text>
                </View>
                <Text style={screenStyles.providerTitle}>{provider.displayName}</Text>
                <Text style={screenStyles.providerBody}>{provider.driverName} · {provider.vehicleLabel} · {provider.vehiclePlate}</Text>
                <Text style={screenStyles.providerBody}>{provider.city} · {provider.country} · {provider.zone}</Text>
                {provider.publicNotes ? <Text style={screenStyles.providerNotes}>{provider.publicNotes}</Text> : null}
              </View>
            ))
          ) : (
            <EmptyState icon="car-outline" title="Aucun chauffeur visible" subtitle="Les chauffeurs disponibles pour ce match apparaîtront ici." />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f8fc' },
  container: { padding: 18, gap: 14, backgroundColor: '#f6f8fc', paddingBottom: 28 },
  hero: { backgroundColor: '#101b2d', borderRadius: 24, padding: 20, gap: 10, borderTopWidth: 4, borderTopColor: '#c8f36a' },
  kicker: { color: '#c8f36a', letterSpacing: 1.2, fontSize: 12, fontFamily: 'Poppins-Bold' },
  title: { color: '#fff', fontSize: 30, lineHeight: 36, fontFamily: 'Poppins-Bold' },
  subtitle: { color: '#d4def0', fontSize: 15, lineHeight: 22, fontFamily: 'Poppins-Regular' },
  rowGap: { gap: 12 },
  textArea: { minHeight: 108, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#dce5f5', paddingHorizontal: 14, paddingVertical: 12, color: '#172033', fontFamily: 'Poppins-Regular', textAlignVertical: 'top' },
  toggle: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce5f5', alignItems: 'center' },
  toggleActive: { backgroundColor: '#e8f7bf', borderColor: '#c8f36a' },
  toggleText: { color: '#172033', fontFamily: 'Poppins-SemiBold' },
  toggleTextActive: { color: '#172033' },
  ctaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  success: { color: '#14532d', fontFamily: 'Poppins-Medium' },
  error: { color: '#b42318', fontFamily: 'Poppins-Medium' },
  providerCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#dce5f5', gap: 6 },
  providerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e8f7bf', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  providerBadgeText: { color: '#172033', fontFamily: 'Poppins-Bold', fontSize: 12 },
  providerStatus: { color: '#2457e6', fontFamily: 'Poppins-SemiBold' },
  providerTitle: { color: '#172033', fontFamily: 'Poppins-Bold', fontSize: 16 },
  providerBody: { color: '#60708b', fontFamily: 'Poppins-Regular' },
  providerNotes: { color: '#172033', fontFamily: 'Poppins-Medium' },
});
