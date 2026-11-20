import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { loadTransportAvailability, loadTransportProfile, saveTransportAvailability, type TransportAvailabilityView, type TransportProfileView } from '../api';
import { type LiveData, type TransportProviderView } from '../types';
import { Card, EmptyState, PrimaryButton, SecondaryButton, styles as uiStyles } from '../ui';
import { t, type Locale } from '../i18n';

const modeLabel = (locale: Locale, providerType: string) => {
  const value = providerType.trim().toLowerCase();
  if (value.includes('vtc')) return t(locale, 'journey.vtcLabel');
  if (value.includes('taxi')) return t(locale, 'journey.taxiLabel');
  if (value.includes('shuttle')) return t(locale, 'journey.shuttleLabel');
  if (value.includes('bus')) return t(locale, 'journey.busLabel');
  if (value.includes('train')) return t(locale, 'journey.trainLabel');
  return providerType;
};

export function TransportScreen({
  locale,
  data,
  loading,
  onReload,
}: {
  locale: Locale;
  data: LiveData | null;
  loading: boolean;
  onReload: () => Promise<void> | void;
}) {
  const matches = useMemo(() => data?.matches ?? [], [data?.matches]);
  const providers = useMemo(() => data?.transportProviders ?? [], [data?.transportProviders]);
  const [matchId, setMatchId] = useState('');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedAvailability, setLoadedAvailability] = useState<TransportAvailabilityView | null>(null);
  const [myProfile, setMyProfile] = useState<TransportProfileView | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const registeredDriver = !!myProfile?.id;
  const selectedMatch = useMemo(() => matches.find((item) => item.id === matchId) ?? null, [matchId, matches]);
  const visibleProviders = useMemo(
    () => providers.filter((provider) => !matchId || provider.matchId === matchId),
    [matchId, providers],
  );
  const availableProviders = useMemo(
    () => visibleProviders.filter((provider) => provider.active && provider.ready),
    [visibleProviders],
  );
  const vtcCount = availableProviders.filter((provider) => provider.providerType.toLowerCase().includes('vtc')).length;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await loadTransportProfile();
        if (!mounted) return;
        setMyProfile(profile);
      } catch {
        if (!mounted) return;
        setMyProfile(null);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!matchId) return;
    (async () => {
      try {
        const availability = await loadTransportAvailability(matchId);
        if (!mounted) return;
        setLoadedAvailability(availability);
        setAvailable(availability.available);
      } catch {
        if (!mounted) return;
        setLoadedAvailability(null);
        setAvailable(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [matchId]);

  const submit = async () => {
    if (!registeredDriver) {
      setError('Crée d’abord ton profil chauffeur dans Profil.');
      return;
    }
    if (!matchId) {
      setError('Choisis d’abord un match pour déclarer ta disponibilité.');
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveTransportAvailability(matchId, { available });
      setMessage(available ? 'Tu es maintenant visible comme disponible.' : 'Tu es maintenant masqué comme non disponible.');
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
          <Text style={screenStyles.title}>Disponibilité chauffeur</Text>
          <Text style={screenStyles.subtitle}>
            Ton profil chauffeur se gère dans le profil utilisateur. Ici tu bascules seulement entre disponible ou pas disponible pour le match choisi.
          </Text>
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

        <Card title="Mon statut" subtitle="Uniquement pour les chauffeurs enregistrés" wide>
          {!registeredDriver ? (
            <EmptyState icon="person-outline" title="Pas encore chauffeur" subtitle="Va dans Profil pour créer ou modifier ton enregistrement chauffeur." />
          ) : (
            <View style={screenStyles.rowGap}>
              {loadingProfile ? <EmptyState icon="time-outline" title="Chargement du profil chauffeur" subtitle="Lecture de ton profil en cours." /> : null}
              <View style={screenStyles.driverSummary}>
                <Text style={screenStyles.driverSummaryTitle}>{myProfile?.displayName || 'Profil chauffeur'}</Text>
                <Text style={screenStyles.driverSummaryBody}>{myProfile?.driverName} · {myProfile?.vehicleLabel}</Text>
                <Text style={screenStyles.driverSummaryBody}>{myProfile?.vehiclePlate} · {myProfile?.city}, {myProfile?.country}</Text>
              </View>
              <Pressable
                onPress={() => setAvailable((value) => !value)}
                style={[screenStyles.availabilityButton, available ? screenStyles.availabilityButtonOn : screenStyles.availabilityButtonOff]}
              >
                <Feather name={available ? 'check-circle' : 'slash'} size={22} color={available ? '#172033' : '#f8fafc'} />
                <View style={screenStyles.availabilityButtonTextBlock}>
                  <Text style={[screenStyles.availabilityButtonTitle, !available && screenStyles.availabilityButtonTitleOff]}>
                    {available ? 'Disponible' : 'Pas disponible'}
                  </Text>
                  <Text style={[screenStyles.availabilityButtonSubtitle, !available && screenStyles.availabilityButtonSubtitleOff]}>
                    Tap pour basculer ton statut immédiatement.
                  </Text>
                </View>
              </Pressable>
              <PrimaryButton
                label={saving ? 'Enregistrement...' : 'Sauver mon statut'}
                onPress={submit}
                icon={saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />}
              />
              <SecondaryButton label="Rafraîchir" onPress={onReload} icon={<Feather name="refresh-cw" size={16} color="#172033" />} />
              {message ? <Text style={screenStyles.success}>{message}</Text> : null}
              {error ? <Text style={screenStyles.error}>{error}</Text> : null}
              {loadedAvailability ? <Text style={uiStyles.helperText}>Dernier état: {loadedAvailability.available ? 'Disponible' : 'Pas disponible'}</Text> : null}
            </View>
          )}
        </Card>

        <Card title="Résumé disponibilité" subtitle="Comptage live par mode" wide>
          <View style={screenStyles.summaryRow}>
            <SummaryPill label="VTC" value={vtcCount} active={vtcCount > 0} />
            <SummaryPill label="Taxi" value={availableProviders.filter((provider) => provider.providerType.toLowerCase().includes('taxi')).length} active={availableProviders.some((provider) => provider.providerType.toLowerCase().includes('taxi'))} />
            <SummaryPill label="Bus" value={availableProviders.filter((provider) => provider.providerType.toLowerCase().includes('bus')).length} active={availableProviders.some((provider) => provider.providerType.toLowerCase().includes('bus'))} />
            <SummaryPill label="Train" value={availableProviders.filter((provider) => provider.providerType.toLowerCase().includes('train')).length} active={availableProviders.some((provider) => provider.providerType.toLowerCase().includes('train'))} />
          </View>
          <Text style={uiStyles.helperText}>
            Quand tu passes à disponible, la liste live dans Reise se met à jour et les fans voient ton mode apparaître immédiatement.
          </Text>
        </Card>

        <Card title="Chauffeurs visibles" subtitle="Fans du match" wide>
          {selectedMatch ? (
            availableProviders.length ? (
              <View style={screenStyles.listGap}>
                {availableProviders.map((provider: TransportProviderView) => (
                  <View key={provider.id} style={screenStyles.providerCard}>
                    <View style={screenStyles.providerTop}>
                      <View style={screenStyles.providerBadge}>
                        <Feather name="truck" size={14} color="#172033" />
                        <Text style={screenStyles.providerBadgeText}>{modeLabel(locale, provider.providerType)}</Text>
                      </View>
                      <Text style={screenStyles.providerStatus}>{provider.active && provider.ready ? 'Disponible' : 'Pas disponible'}</Text>
                    </View>
                    <Text style={screenStyles.providerTitle}>{provider.displayName}</Text>
                    <Text style={screenStyles.providerBody}>{provider.driverName} · {provider.vehicleLabel}</Text>
                    <Text style={screenStyles.providerBody}>{provider.city}, {provider.country}</Text>
                    {provider.publicNotes ? <Text style={screenStyles.providerNotes}>{provider.publicNotes}</Text> : null}
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="car-outline" title="Aucun chauffeur visible" subtitle="Les chauffeurs disponibles pour ce match apparaîtront ici." />
            )
          ) : (
            <EmptyState icon="calendar-outline" title="Choisis un match" subtitle="La liste des chauffeurs disponibles dépend du match sélectionné." />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryPill({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <View style={[screenStyles.summaryPill, active && screenStyles.summaryPillActive]}>
      <Text style={screenStyles.summaryLabel}>{label}</Text>
      <Text style={screenStyles.summaryValue}>{value}</Text>
    </View>
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
  listGap: { gap: 12 },
  driverSummary: { backgroundColor: '#fff', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#dce5f5', gap: 4 },
  driverSummaryTitle: { color: '#172033', fontSize: 16, fontFamily: 'Poppins-Bold' },
  driverSummaryBody: { color: '#60708b', fontFamily: 'Poppins-Regular' },
  availabilityButton: { borderRadius: 24, paddingVertical: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1 },
  availabilityButtonOn: { backgroundColor: '#c8f36a', borderColor: '#b9e840' },
  availabilityButtonOff: { backgroundColor: '#172033', borderColor: '#101827' },
  availabilityButtonTextBlock: { flex: 1, gap: 4 },
  availabilityButtonTitle: { color: '#172033', fontFamily: 'Poppins-Bold', fontSize: 19 },
  availabilityButtonTitleOff: { color: '#f8fafc' },
  availabilityButtonSubtitle: { color: '#172033', fontFamily: 'Poppins-Medium' },
  availabilityButtonSubtitleOff: { color: '#d4def0' },
  success: { color: '#14532d', fontFamily: 'Poppins-Medium' },
  error: { color: '#b42318', fontFamily: 'Poppins-Medium' },
  providerCard: { padding: 14, borderRadius: 18, borderWidth: 1, borderColor: '#e6eaf0', backgroundColor: '#fff', gap: 8 },
  providerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e8f7bf', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  providerBadgeText: { color: '#172033', fontFamily: 'Poppins-Bold', fontSize: 12 },
  providerStatus: { color: '#2457e6', fontFamily: 'Poppins-SemiBold' },
  providerTitle: { color: '#172033', fontFamily: 'Poppins-Bold', fontSize: 16 },
  providerBody: { color: '#60708b', fontFamily: 'Poppins-Regular' },
  providerNotes: { color: '#172033', fontFamily: 'Poppins-Medium' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryPill: { minWidth: 78, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce5f5' },
  summaryPillActive: { backgroundColor: '#edf8c1', borderColor: '#c8f36a' },
  summaryLabel: { color: '#60708b', fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  summaryValue: { color: '#172033', fontSize: 18, fontFamily: 'Poppins-Bold' },
});
