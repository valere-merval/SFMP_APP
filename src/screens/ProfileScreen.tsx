import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { getScreenCopy } from '../screenCopy';
import { type LiveData } from '../types';
import { Card, EmptyState, Row, styles } from '../ui';
import type { Locale } from '../i18n';

export function ProfileScreen({ data, loading, locale }: { data: LiveData | null; loading: boolean; locale: Locale }) {
  const copy = getScreenCopy(locale).profile;
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>
        <Card title={copy.profileTitle} subtitle={copy.profileSubtitle} wide>
          <View style={styles.bulletRow}>
            <Feather name="user" size={16} color="#2457e6" />
            <Text style={styles.rowTitle}>{copy.profileBody}</Text>
          </View>
          <Row leftTitle={copy.preferencesLabel} leftSubtitle={copy.preferencesValue} rightTitle="Active" rightSubtitle="Settings" />
        </Card>
        <Card title={copy.historyTitle} subtitle={copy.historySubtitle}>
          {data ? data.events.map((item) => (
            <Row key={item.id} leftTitle={item.title} leftSubtitle={`${item.venue} · ${item.city}`} rightTitle={item.date} rightSubtitle={item.status} />
          )) : loading ? (
            <EmptyState icon="time-outline" title={copy.loadingTitle} subtitle={copy.loadingBody} />
          ) : (
            <EmptyState icon="person-outline" title={copy.emptyTitle} subtitle={copy.emptyBody} />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
