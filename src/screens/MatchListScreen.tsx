import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...matches]
      .filter((item) => !term || [item.homeTeam, item.awayTeam, item.city, item.country, item.venue, item.stage].some((value) => value.toLowerCase().includes(term)))
      .sort((a, b) => (ascending ? a.homeTeam.localeCompare(b.homeTeam) : b.homeTeam.localeCompare(a.homeTeam)));
  }, [ascending, matches, search]);

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{catalog?.title ?? copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <Card title={copy.cardTitle} subtitle={copy.cardSubtitle} wide>
          <Input
            placeholder={copy.searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            keyboardType="default"
          />
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>
              {items.length} {copy.countSuffix}
            </Text>
            <SecondaryButton
              label={ascending ? copy.sortAsc : copy.sortDesc}
              onPress={() => setAscending(value => !value)}
              icon={<Feather name="arrow-down" size={16} color="#0B1F5B" />}
            />
          </View>
        </Card>

        <View style={localStyles.list}>
          {items.map(match => (
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
              <Image
                source={{ uri: match.imageUrl }}
                style={localStyles.image}
              />
              <View style={localStyles.overlay}>
                <View style={styles.rowBetween}>
                  <Text style={localStyles.stage}>{match.stage}</Text>
                  <Text style={localStyles.ticket}>
                    {match.ticketAvailable
                      ? match.ticketPrice || t(locale, 'common.ticketsLive')
                      : t(locale, 'common.soldOut')}
                  </Text>
                </View>
                <View style={localStyles.teamRow}>
                  <FlagBadge value={match.homeFlag} />
                  <Text style={localStyles.teams}>{match.homeTeam}</Text>
                </View>
                <View style={localStyles.teamRow}>
                  <Text style={localStyles.vs}>vs</Text>
                </View>
                <View style={localStyles.teamRow}>
                  <FlagBadge value={match.awayFlag} />
                  <Text style={localStyles.teams}>{match.awayTeam}</Text>
                </View>
                <Text style={localStyles.meta}>
                  {formatMatchDateTime(match.date, match.time)}
                </Text>
                <Text style={localStyles.meta}>
                  {match.venue} · {match.city}, {match.country}
                </Text>
                <Text style={localStyles.meta}>
                  {match.gate} · {match.sector}
                </Text>
                <Text style={localStyles.meta}>
                  {match.ticketAvailable
                    ? `${match.ticketsRemaining ?? match.ticketsTotal ?? 0} ${t(
                        locale,
                        'common.ticketsRemaining',
                      )}`
                    : t(locale, 'common.ticketsUnavailable')}
                </Text>
                <Text style={localStyles.description}>
                  {match.transitSummary}
                </Text>
                <View style={styles.ctaRow}>
                  <PrimaryButton
                    label={copy.openHub}
                    onPress={() => onSelectMatch(match)}
                    icon={<Feather name="arrow-right" size={16} color="#fff" />}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <Card
          title={copy.subtitle}
          subtitle={t(locale, 'common.navigation')}
          wide
        >
          <View style={styles.ctaRow}>
            <SecondaryButton
              label={copy.backToEvents}
              onPress={onBackToCatalog}
              icon={<Feather name="grid" size={16} color="#1d3fb3" />}
            />
            <SecondaryButton
              label={copy.back}
              onPress={onBack}
              icon={<Feather name="chevron-left" size={16} color="#1d3fb3" />}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const localStyles = {
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden' as const,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6eaf0',
  },
  image: {
    width: '100%',
    height: 170,
  },
  overlay: {
    padding: 14,
    gap: 6,
  },
  stage: {
    backgroundColor: '#edf2ff',
    color: '#1d3fb3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  ticket: {
    color: '#D946EF',
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
  },
  teamRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  flagImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#edf2ff',
  },
  flagText: {
    width: 24,
    textAlign: 'center' as const,
    color: '#172033',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  teams: {
    color: '#020B2D',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Oswald-Bold',
  },
  vs: {
    color: '#06B6D4',
    fontFamily: 'Oswald-Bold',
    fontSize: 30,
    marginLeft: '30%',
  },
  meta: {
    color: '#06B6D4',
    fontFamily: 'Oswald-Light',
    fontSize: 10,
  },
  description: {
    color: '#44536b',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
};
