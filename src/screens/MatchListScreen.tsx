import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { EventCatalogCard, MatchCard } from '../types';
import { Card, Input, PrimaryButton, SecondaryButton, styles } from '../ui';

export function MatchListScreen({
  catalog,
  matches,
  onSelectMatch,
  onBack,
  onBackToCatalog,
}: {
  catalog: EventCatalogCard | null;
  matches: MatchCard[];
  onSelectMatch: (match: MatchCard) => void;
  onBack: () => void;
  onBackToCatalog: () => void;
}) {
  const [search, setSearch] = useState('');
  const [ascending, setAscending] = useState(true);

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...matches]
      .filter((item) => !term || [item.homeTeam, item.awayTeam, item.city, item.country, item.venue, item.stage].some((value) => value.toLowerCase().includes(term)))
      .sort((a, b) => (ascending ? a.homeTeam.localeCompare(b.homeTeam) : b.homeTeam.localeCompare(a.homeTeam)));
  }, [ascending, matches, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>MATCHES</Text>
          <Text style={styles.title}>{catalog?.title ?? 'Selected event'}</Text>
          <Text style={styles.subtitle}>Choose the exact match to open the hub with the live travel and gate data.</Text>
        </View>

        <Card title="Match catalogue" subtitle="Search and sort" wide>
          <Input placeholder="Search matches" value={search} onChangeText={setSearch} keyboardType="default" />
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>{items.length} matches available</Text>
            <SecondaryButton
              label={ascending ? 'A → Z' : 'Z → A'}
              onPress={() => setAscending((value) => !value)}
              icon={<Feather name="arrow-down" size={16} color="#1d3fb3" />}
            />
          </View>
        </Card>

        <View style={localStyles.list}>
          {items.map((match) => (
            <Pressable key={match.id} style={localStyles.card} onPress={() => onSelectMatch(match)}>
              <Image source={{ uri: match.imageUrl }} style={localStyles.image} />
              <View style={localStyles.overlay}>
                <View style={styles.rowBetween}>
                  <Text style={localStyles.stage}>{match.stage}</Text>
                  <Text style={localStyles.ticket}>{match.ticketPrice}</Text>
                </View>
                <Text style={localStyles.teams}>{match.homeFlag} {match.homeTeam} vs {match.awayFlag} {match.awayTeam}</Text>
                <Text style={localStyles.meta}>{match.date} · {match.time}</Text>
                <Text style={localStyles.meta}>{match.venue} · {match.city}, {match.country}</Text>
                <Text style={localStyles.meta}>{match.gate} · {match.sector}</Text>
                <Text style={localStyles.description}>{match.transitSummary}</Text>
                <View style={styles.ctaRow}>
                  <PrimaryButton label="Open hub" onPress={() => onSelectMatch(match)} icon={<Feather name="arrow-right" size={16} color="#fff" />} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <Card title="Change your selection" subtitle="Navigation" wide>
          <View style={styles.ctaRow}>
            <SecondaryButton label="Back to events" onPress={onBackToCatalog} icon={<Feather name="grid" size={16} color="#1d3fb3" />} />
            <SecondaryButton label="Back" onPress={onBack} icon={<Feather name="chevron-left" size={16} color="#1d3fb3" />} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
    color: '#2457e6',
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
  },
  teams: {
    color: '#172033',
    fontSize: 17,
    lineHeight: 23,
    fontFamily: 'Poppins-ExtraBold',
  },
  meta: {
    color: '#60708b',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  description: {
    color: '#44536b',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
};
