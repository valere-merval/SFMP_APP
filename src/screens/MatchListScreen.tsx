import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getScreenCopy } from '../screenCopy';
import type { EventCatalogCard, MatchCard } from '../types';
import { Card, Input, PrimaryButton, SecondaryButton, styles } from '../ui';
import { trackTelemetry } from '../telemetry';
import { t, type Locale } from '../i18n';
import { formatMatchDateTime } from '../share.ts';

function isImageUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function FlagBadge({ value }: { value: string }) {
  if (isImageUrl(value)) {
    return <Image source={{ uri: value }} style={localStyles.flagImage} />;
  }

  return <Text style={localStyles.flagText}>{value}</Text>;
}

export function MatchListScreen({
  catalog,
  matches,
  locale,
  onSelectMatch,
  onBack,
  onBackToCatalog,
}: {
  catalog: EventCatalogCard | null;
  matches: MatchCard[];
  locale: Locale;
  onSelectMatch: (match: MatchCard) => void;
  onBack: () => void;
  onBackToCatalog: () => void;
}) {
  const copy = getScreenCopy(locale).matches;
  const [search, setSearch] = useState('');
  const [ascending, setAscending] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'tickets'>('all');

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...matches]
      .filter((item) => {
        const searchable = [item.homeTeam, item.awayTeam, item.city, item.country, item.venue, item.stage].some((value) =>
          value.toLowerCase().includes(term),
        );
        const matchesFilter =
          filter === 'all' ||
          (filter === 'live' && item.transitSummary.toLowerCase().includes('live')) ||
          (filter === 'tickets' && item.ticketAvailable);
        return (!term || searchable) && matchesFilter;
      })
      .sort((a, b) => (ascending ? a.homeTeam.localeCompare(b.homeTeam) : b.homeTeam.localeCompare(a.homeTeam)));
  }, [ascending, filter, matches, search]);

  const liveCount = matches.filter((item) => item.transitSummary.toLowerCase().includes('live')).length;

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={localStyles.heroHeader}>
          <View style={localStyles.heroTopRow}>
            <View style={localStyles.brandChip}>
              <View style={localStyles.brandMark} />
              <View style={localStyles.brandCopy}>
                <Text style={localStyles.brandKicker}>Smart Fan Mobility</Text>
                <Text style={localStyles.brandName}>{copy.eyebrow}</Text>
              </View>
            </View>
            <View style={localStyles.liveBadge}>
              <View style={localStyles.liveDot} />
              <Text style={localStyles.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          <Text style={localStyles.heroTitle}>{catalog?.title ?? copy.title}</Text>
          <Text style={localStyles.heroSubtitle}>{copy.subtitle}</Text>

          <View style={localStyles.heroChips}>
            <View style={localStyles.heroChipAccent}>
              <Text style={localStyles.heroChipText}>{items.length} matchs</Text>
            </View>
            <View style={localStyles.heroChipSoft}>
              <Text style={localStyles.heroChipSoftText}>{liveCount} en direct</Text>
            </View>
            <View style={localStyles.heroChipSoft}>
              <Text style={localStyles.heroChipSoftText}>{t(locale, 'common.navigation')}</Text>
            </View>
          </View>
        </View>

        <Card title={copy.cardTitle} subtitle={copy.cardSubtitle} wide>
          <Input
            placeholder={copy.searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            keyboardType="default"
          />

          <View style={localStyles.filterRow}>
            <Pressable
              style={[localStyles.filterChip, filter === 'all' && localStyles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[localStyles.filterChipText, filter === 'all' && localStyles.filterChipTextActive]}>Tous</Text>
            </Pressable>
            <Pressable
              style={[localStyles.filterChip, filter === 'live' && localStyles.filterChipActive]}
              onPress={() => setFilter('live')}
            >
              <Text style={[localStyles.filterChipText, filter === 'live' && localStyles.filterChipTextActive]}>Direct</Text>
            </Pressable>
            <Pressable
              style={[localStyles.filterChip, filter === 'tickets' && localStyles.filterChipActive]}
              onPress={() => setFilter('tickets')}
            >
              <Text style={[localStyles.filterChipText, filter === 'tickets' && localStyles.filterChipTextActive]}>Billets</Text>
            </Pressable>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.muted}>
              {items.length} {copy.countSuffix}
            </Text>
            <SecondaryButton
              label={ascending ? copy.sortAsc : copy.sortDesc}
              onPress={() => setAscending((value) => !value)}
              icon={<Feather name="arrow-down" size={16} color="#09111f" />}
            />
          </View>
        </Card>

        <View style={localStyles.list}>
          {items.map((match) => (
            <Pressable
              key={match.id}
              style={localStyles.card}
              onPress={() => {
                trackTelemetry('match_selected', 'MatchList', {
                  matchId: match.id,
                  catalogId: match.catalogId,
                  homeTeam: match.homeTeam,
                  awayTeam: match.awayTeam,
                });
                onSelectMatch(match);
              }}
            >
              <View style={localStyles.cardTopRow}>
                <Text style={localStyles.stage}>{match.stage}</Text>
                <Text style={localStyles.ticket}>
                  {match.ticketAvailable ? match.ticketPrice || t(locale, 'common.ticketsLive') : t(locale, 'common.soldOut')}
                </Text>
              </View>

              <View style={localStyles.teamHero}>
                <View style={localStyles.teamColumn}>
                  <FlagBadge value={match.homeFlag} />
                  <Text style={localStyles.teams}>{match.homeTeam}</Text>
                </View>
                <Text style={localStyles.vs}>VS</Text>
                <View style={localStyles.teamColumnRight}>
                  <FlagBadge value={match.awayFlag} />
                  <Text style={localStyles.teams}>{match.awayTeam}</Text>
                </View>
              </View>

              <View style={localStyles.metaGrid}>
                <View style={localStyles.metaItem}>
                  <Text style={localStyles.metaLabel}>DATE</Text>
                  <Text style={localStyles.metaValue}>{formatMatchDateTime(match.date, match.time)}</Text>
                </View>
                <View style={localStyles.metaItem}>
                  <Text style={localStyles.metaLabel}>STADE</Text>
                  <Text style={localStyles.metaValue}>{match.venue}</Text>
                </View>
                <View style={localStyles.metaItem}>
                  <Text style={localStyles.metaLabel}>VILLE</Text>
                  <Text style={localStyles.metaValue}>{match.city}</Text>
                </View>
                <View style={localStyles.metaItem}>
                  <Text style={localStyles.metaLabel}>ACCÈS</Text>
                  <Text style={localStyles.metaValue}>{match.gate} · {match.sector}</Text>
                </View>
              </View>

              <View style={localStyles.transportPill}>
                <Feather name="navigation" size={14} color="#9df5ff" />
                <Text style={localStyles.transportPillText}>{match.transitSummary}</Text>
              </View>

              <View style={localStyles.bottomRow}>
                <View style={localStyles.priceBlock}>
                  <Text style={localStyles.priceLabel}>{match.ticketAvailable ? t(locale, 'common.ticketsRemaining') : t(locale, 'common.ticketsUnavailable')}</Text>
                  <Text style={localStyles.priceValue}>
                    {match.ticketAvailable ? `${match.ticketsRemaining ?? match.ticketsTotal ?? 0}` : t(locale, 'common.soldOut')}
                  </Text>
                </View>
                <View style={localStyles.ctaWrap}>
                  <PrimaryButton
                    label={copy.openHub}
                    onPress={() => onSelectMatch(match)}
                    icon={<Feather name="arrow-right" size={16} color="#08111f" />}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <Card title={copy.subtitle} subtitle={t(locale, 'common.navigation')} wide>
          <View style={styles.ctaRow}>
            <SecondaryButton
              label={copy.backToEvents}
              onPress={onBackToCatalog}
              icon={<Feather name="grid" size={16} color="#22d3ee" />}
            />
            <SecondaryButton
              label={copy.back}
              onPress={onBack}
              icon={<Feather name="chevron-left" size={16} color="#22d3ee" />}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  heroHeader: {
    backgroundColor: '#07101b',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
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
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(201, 243, 106, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.24)',
  },
  brandCopy: {
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  brandKicker: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  brandName: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#c8f36a',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#07101b',
  },
  liveBadgeText: {
    color: '#07101b',
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
  },
  heroTitle: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    lineHeight: 36,
  },
  heroSubtitle: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroChipAccent: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#c8f36a',
  },
  heroChipSoft: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.16)',
  },
  heroChipText: {
    color: '#07101b',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
  heroChipSoftText: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0f1729',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterChipActive: {
    backgroundColor: '#c8f36a',
    borderColor: '#c8f36a',
  },
  filterChipText: {
    color: '#cbd5e1',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#08111f',
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.14)',
    padding: 16,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stage: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    color: '#9df5ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  ticket: {
    color: '#c8f36a',
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
  },
  teamHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  teamColumn: {
    flex: 1,
    gap: 8,
  },
  teamColumnRight: {
    flex: 1,
    gap: 8,
    alignItems: 'flex-end',
  },
  flagImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#edf2ff',
  },
  flagText: {
    width: 24,
    textAlign: 'center',
    color: '#f8fafc',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  teams: {
    color: '#f8fbff',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Oswald-Bold',
  },
  vs: {
    color: '#06B6D4',
    fontFamily: 'Oswald-Bold',
    fontSize: 28,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexGrow: 1,
    minWidth: '45%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metaLabel: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  metaValue: {
    color: '#f8fbff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  transportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  transportPillText: {
    flex: 1,
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceBlock: {
    flex: 1,
    gap: 2,
  },
  priceLabel: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  priceValue: {
    color: '#c8f36a',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  ctaWrap: {
    minWidth: 142,
  },
});
