import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { EventCatalogCard } from '../types';
import { Card, Input, PrimaryButton, SecondaryButton, styles } from '../ui';

export function EventCatalogScreen({
  catalogs,
  onSelectCatalog,
  onSignOut,
}: {
  catalogs: EventCatalogCard[];
  onSelectCatalog: (catalog: EventCatalogCard) => void;
  onSignOut: () => void;
}) {
  const [search, setSearch] = useState('');
  const [ascending, setAscending] = useState(true);

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...catalogs]
      .filter((item) => !term || [item.title, item.description, item.country, item.sport, item.badge].some((value) => value.toLowerCase().includes(term)))
      .sort((a, b) => (ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));
  }, [ascending, catalogs, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>EVENTS</Text>
          <Text style={styles.title}>Choose an event</Text>
          <Text style={styles.subtitle}>Pick a catalogue first, then open the live match hub for that event.</Text>
        </View>

        <Card title="Event catalog" subtitle="Search and sort" wide>
          <Input placeholder="Search events" value={search} onChangeText={setSearch} keyboardType="default" />
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>{items.length} catalogues available</Text>
            <SecondaryButton
              label={ascending ? 'A → Z' : 'Z → A'}
              onPress={() => setAscending((value) => !value)}
              icon={<Feather name="arrow-down" size={16} color="#1d3fb3" />}
            />
          </View>
        </Card>

        <View style={localStyles.grid}>
          {items.map((catalog) => (
            <Pressable key={catalog.id} style={localStyles.card} onPress={() => onSelectCatalog(catalog)}>
              <Image source={{ uri: catalog.imageUrl }} style={localStyles.image} />
              <View style={localStyles.overlay}>
                <View style={styles.rowBetween}>
                  <Text style={localStyles.badge}>{catalog.badge}</Text>
                  <Text style={localStyles.count}>{catalog.eventCount} events</Text>
                </View>
                <Text style={localStyles.title}>{catalog.title}</Text>
                <Text style={localStyles.meta}>{catalog.sport} · {catalog.country}</Text>
                <Text style={localStyles.description}>{catalog.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Card title="Need a different language?" subtitle="Account" wide>
          <Text style={styles.muted}>The app starts in the phone language if supported, otherwise English. You can keep the language in the account profile later.</Text>
          <View style={styles.ctaRow}>
            <PrimaryButton label="Continue" onPress={() => undefined} icon={<Feather name="arrow-right" size={16} color="#fff" />} />
            <SecondaryButton label="Sign out" onPress={onSignOut} icon={<Feather name="log-out" size={16} color="#1d3fb3" />} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = {
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  card: {
    width: '48%' as const,
    borderRadius: 20,
    overflow: 'hidden' as const,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6eaf0',
  },
  image: {
    width: '100%',
    height: 140,
  },
  overlay: {
    padding: 14,
    gap: 8,
  },
  badge: {
    backgroundColor: '#101b2d',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  count: {
    color: '#2457e6',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  title: {
    color: '#172033',
    fontSize: 17,
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
  },
};
