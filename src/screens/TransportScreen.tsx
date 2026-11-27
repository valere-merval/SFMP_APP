import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { loadTransportAvailability, loadTransportProfile, saveTransportAvailability, listPublicTransportProfiles, type TransportAvailabilityView, type TransportProfileView } from '../api';
import { type LiveData, type TransportProviderView } from '../types';
import { Card, EmptyState, PrimaryButton, SecondaryButton, styles as uiStyles } from '../ui';
import { t, type Locale } from '../i18n';
import { openGoogleMapsDirections } from '../maps';

const modeLabel = (locale: Locale, providerType: string) => {
  const value = providerType.trim().toLowerCase();
  if (value.includes('vtc')) return t(locale, 'journey.vtcLabel');
  if (value.includes('taxi')) return t(locale, 'journey.taxiLabel');
  if (value.includes('shuttle')) return t(locale, 'journey.shuttleLabel');
  if (value.includes('bus')) return t(locale, 'journey.busLabel');
  if (value.includes('train')) return t(locale, 'journey.trainLabel');
  if (value.includes('tram')) return t(locale, 'journey.tramLabel');
  return providerType;
};

const providerDestination = (provider: TransportProviderView) => {
  if (provider.stationLatitude != null && provider.stationLongitude != null) {
    return `${provider.stationLatitude},${provider.stationLongitude}`;
  }
  return provider.stationAddress?.trim() || `${provider.city}, ${provider.country}`;
};

export function TransportScreen({
  locale,
  data,
  loading,
  onReload,
  initialMatchId,
}: {
  locale: Locale;
  data: LiveData | null;
  loading: boolean;
  onReload: () => Promise<void> | void;
  initialMatchId?: string | null;
}) {
  const matches = useMemo(() => data?.matches ?? [], [data?.matches]);
  const baseProviders = useMemo(() => data?.transportProviders ?? [], [data?.transportProviders]);
  const [publicProviders, setPublicProviders] = useState<TransportProviderView[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [matchId, setMatchId] = useState(() => initialMatchId ?? '');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedAvailability, setLoadedAvailability] = useState<TransportAvailabilityView | null>(null);
  const [myProfile, setMyProfile] = useState<TransportProfileView | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const registeredDriver = !!myProfile?.id;
  const selectedMatch = useMemo(() => matches.find((item) => item.id === matchId) ?? null, [matchId, matches]);
  const providers = useMemo(() => {
    const merged = [...baseProviders, ...publicProviders];
    const seen = new Set<string>();
    return merged.filter((provider) => {
      const key = `${provider.id}:${provider.matchId}:${provider.providerType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [baseProviders, publicProviders]);
  const visibleProviders = useMemo(
    () => providers.filter((provider) => !matchId || provider.matchId === matchId),
    [matchId, providers],
  );
  const availableProviders = useMemo(
    () => visibleProviders.filter((provider) => provider.active || provider.ready),
    [visibleProviders],
  );
  const globalAvailableProviders = useMemo(
    () => providers.filter((provider) => provider.active || provider.ready),
    [providers],
  );
  const vtcCount = globalAvailableProviders.filter((provider) => provider.providerType.toLowerCase().includes('vtc')).length;

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
    if (!initialMatchId) return;
    if (matchId && matches.some((item) => item.id === matchId)) return;
    setMatchId(initialMatchId);
  }, [initialMatchId, matchId, matches]);

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

  useEffect(() => {
    let mounted = true;
    setProvidersLoading(true);
    (async () => {
      try {
        const live = await listPublicTransportProfiles(matchId || undefined);
        if (!mounted) return;
        setPublicProviders(live);
      } catch {
        if (!mounted) return;
        setPublicProviders([]);
      } finally {
        if (mounted) setProvidersLoading(false);
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
    <View style={screenStyles.screen}>
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
                <Feather name={available ? 'check-circle' : 'slash'} size={28} color={available ? '#f8fafc' : '#f8fafc'} />
                <View style={screenStyles.availabilityButtonTextBlock}>
                  <Text style={[screenStyles.availabilityButtonTitle, !available && screenStyles.availabilityButtonTitleOff]}>
                    {available ? t(locale, 'common.available') : t(locale, 'common.notAvailable')}
                  </Text>
                  <Text style={[screenStyles.availabilityButtonSubtitle, !available && screenStyles.availabilityButtonSubtitleOff]}>
                    {t(locale, 'transport.driverAvailabilityHint')}
                  </Text>
                </View>
              </Pressable>
              <PrimaryButton
                label={saving ? 'Enregistrement...' : 'Sauver mon statut'}
                onPress={submit}
                icon={saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />}
              />
              <SecondaryButton label="Rafraîchir" onPress={onReload} icon={<Feather name="refresh-cw" size={16} color="#f8fafc" />} />
              {message ? <Text style={screenStyles.success}>{message}</Text> : null}
              {error ? <Text style={screenStyles.error}>{error}</Text> : null}
              {loadedAvailability ? <Text style={uiStyles.helperText}>Dernier état: {loadedAvailability.available ? 'Disponible' : 'Pas disponible'}</Text> : null}
            </View>
          )}
        </Card>

        <Card title="Résumé disponibilité" subtitle="Comptage live par mode" wide>
          <View style={screenStyles.summaryRow}>
            <SummaryPill label="VTC" value={vtcCount} active={vtcCount > 0} />
            <SummaryPill label="Taxi" value={globalAvailableProviders.filter((provider) => provider.providerType.toLowerCase().includes('taxi')).length} active={globalAvailableProviders.some((provider) => provider.providerType.toLowerCase().includes('taxi'))} />
            <SummaryPill label="Bus" value={globalAvailableProviders.filter((provider) => provider.providerType.toLowerCase().includes('bus')).length} active={globalAvailableProviders.some((provider) => provider.providerType.toLowerCase().includes('bus'))} />
            <SummaryPill label="Train" value={globalAvailableProviders.filter((provider) => provider.providerType.toLowerCase().includes('train')).length} active={globalAvailableProviders.some((provider) => provider.providerType.toLowerCase().includes('train'))} />
          </View>
          <Text style={uiStyles.helperText}>
            Quand tu passes à disponible, la liste live dans Reise se met à jour et les fans voient ton mode apparaître immédiatement.
          </Text>
        </Card>

        <Card title="Chauffeurs visibles" subtitle="Fans du match" wide>
          {providersLoading ? (
            <EmptyState icon="loader-outline" title="Chargement des chauffeurs" subtitle="Lecture de la disponibilité live pour ce match." />
          ) : selectedMatch ? (
            availableProviders.length ? (
              <View style={screenStyles.listGap}>
                {availableProviders.map((provider: TransportProviderView) => (
                  <View key={provider.id} style={screenStyles.providerCard}>
                    <View style={screenStyles.providerTop}>
                      <View style={screenStyles.providerBadge}>
                        <Feather name="truck" size={14} color="#f8fafc" />
                        <Text style={screenStyles.providerBadgeText}>{modeLabel(locale, provider.providerType)}</Text>
                      </View>
                      <Text style={screenStyles.providerStatus}>{provider.active || provider.ready ? 'Disponible' : 'Pas disponible'}</Text>
                    </View>
                    <Text style={screenStyles.providerTitle}>{provider.displayName}</Text>
                    <Text style={screenStyles.providerBody}>{provider.driverName} · {provider.vehicleLabel}</Text>
                    <Text style={screenStyles.providerBody}>{provider.city}, {provider.country}</Text>
                    {provider.stationAddress ? <Text style={screenStyles.providerBody}>{provider.stationAddress}</Text> : null}
                    {provider.publicNotes ? <Text style={screenStyles.providerNotes}>{provider.publicNotes}</Text> : null}
                    <Pressable
                      onPress={() => {
                        void openGoogleMapsDirections(providerDestination(provider));
                      }}
                      style={screenStyles.stationButton}
                    >
                      <Text style={screenStyles.stationButtonText}>{t(locale, 'common.navigate')}</Text>
                    </Pressable>
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
    </View>
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
  screen: { flex: 1, backgroundColor: '#070d18' },
  container: { gap: 14, backgroundColor: '#070d18', paddingBottom: 28 },
  hero: { backgroundColor: '#c8f36a', padding: 20, gap: 10 },
  kicker: {
    color: '#09111f',
    letterSpacing: 1.2,
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 36,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    color: '#020B2D',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  rowGap: { gap: 12 },
  listGap: { gap: 12 },
  driverSummary: {
    backgroundColor: '#0b1220',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    gap: 4,
  },
  driverSummaryTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  driverSummaryBody: { color: '#9fb2cb', fontFamily: 'Poppins-Regular' },
  availabilityButton: {
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    width: '100%',
    minHeight: 112,
  },
  availabilityButtonOn: {
    backgroundColor: '#06B6D4',
    borderColor: '#06B6D4',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  availabilityButtonOff: {
    backgroundColor: '#f8fafc',
    borderColor: '#101827',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  availabilityButtonTextBlock: { flex: 1, gap: 4 },
  availabilityButtonTitle: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
  },
  availabilityButtonTitleOff: { color: '#f8fafc' },
  availabilityButtonSubtitle: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  availabilityButtonSubtitleOff: { color: '#d4def0' },
  success: { color: '#14532d', fontFamily: 'Poppins-Medium' },
  error: { color: '#b42318', fontFamily: 'Poppins-Medium' },
  providerCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#06B6D4',
    backgroundColor: '#0b1220',
    gap: 8,
  },
  providerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#94A3B8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  providerBadgeText: {
    color: '#f8fafc',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
  providerStatus: { color: '#c8f36a', fontFamily: 'Oswald-SemiBold' },
  providerTitle: { color: '#f8fafc', fontFamily: 'Poppins-Bold', fontSize: 16 },
  providerBody: { color: '#9fb2cb', fontFamily: 'Poppins-Regular' },
  providerNotes: { color: '#f8fafc', fontFamily: 'Poppins-Medium' },
  stationButton: {
    marginTop: 2,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#c8f36a',
  },
  stationButtonText: { color: '#09111f', fontFamily: 'Poppins-Bold', fontSize: 12 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryPill: {
    minWidth: 78,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
  },
  summaryPillActive: { backgroundColor: '#06B6D4', borderColor: '#94A3B8' },
  summaryLabel: {
    color: '#9fb2cb',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  summaryValue: { color: '#f8fafc', fontSize: 18, fontFamily: 'Poppins-Bold' },
});
