import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { getScreenCopy } from '../screenCopy';
import type { EventCatalogCard } from '../types';
import { Card, Input, PrimaryButton, SecondaryButton, styles } from '../ui';
import type { Locale } from '../i18n';

export function EventCatalogScreen({
  catalogs,
  locale,
  onSelectCatalog,
  onSignOut,
}: {
  catalogs: EventCatalogCard[];
  locale: Locale;
  onSelectCatalog: (catalog: EventCatalogCard) => void;
  onSignOut: () => void;
}) {
  const copy = getScreenCopy(locale).catalog;
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
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <Card title={copy.cardTitle} subtitle={copy.cardSubtitle} wide>
          <Input placeholder={copy.searchPlaceholder} value={search} onChangeText={setSearch} keyboardType="default" />
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>{items.length} {copy.countSuffix}</Text>
            <SecondaryButton
              label={ascending ? copy.sortAsc : copy.sortDesc}
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
                  <Text style={localStyles.liveTag}>LIVE</Text>
                </View>
                <Text style={localStyles.title}>{catalog.title}</Text>
                <Text style={localStyles.meta}>{catalog.sport} · {catalog.country}</Text>
                <Text style={localStyles.count}>{catalog.eventCount} matches</Text>
                <Text style={localStyles.description}>{catalog.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Card title={copy.helperTitle} subtitle={copy.helperTitle} wide>
          <Text style={styles.muted}>{copy.helperBody}</Text>
          <View style={styles.ctaRow}>
            <PrimaryButton label={copy.continue} onPress={() => undefined} icon={<Feather name="arrow-right" size={16} color="#fff" />} />
            <SecondaryButton label={copy.signOut} onPress={onSignOut} icon={<Feather name="log-out" size={16} color="#1d3fb3" />} />
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
    color: '#c8f36a',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  liveTag: {
    backgroundColor: '#c8f36a',
    color: '#172033',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
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
