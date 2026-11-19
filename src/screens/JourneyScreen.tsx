import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getScreenCopy } from '../screenCopy';
import { type LiveData } from '../types';
import { Card, EmptyState, Row, styles } from '../ui';
import type { Locale } from '../i18n';

export function JourneyScreen({ data, loading, locale }: { data: LiveData | null; loading: boolean; locale: Locale }) {
  const copy = getScreenCopy(locale).journey;
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>
        <Card title={copy.plannerTitle} subtitle={copy.plannerSubtitle} wide>
          <View style={styles.cardBody}>
            {[
              { icon: <Ionicons name="compass-outline" size={16} color="#2457e6" />, title: copy.stepOneTitle, subtitle: copy.stepOneBody },
              { icon: <Feather name="clock" size={16} color="#2457e6" />, title: copy.stepTwoTitle, subtitle: copy.stepTwoBody },
              { icon: <Feather name="check-circle" size={16} color="#2457e6" />, title: copy.stepThreeTitle, subtitle: copy.stepThreeBody },
            ].map((item) => (
              <View key={item.title} style={styles.bulletRow}>
                {item.icon}
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.muted}>{item.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
        <Card title={copy.checkoutTitle} subtitle={copy.checkoutSubtitle}>
          {data ? (
            data.bookings.map((item) => (
              <Row key={item.id} leftTitle={item.fanName} leftSubtitle={`${item.option} · ${item.status}`} rightTitle={item.time} rightSubtitle="Departure" />
            ))
          ) : loading ? (
            <EmptyState icon="time-outline" title={copy.loadingTitle} subtitle={copy.loadingBody} />
          ) : (
            <EmptyState icon="ticket-outline" title={copy.emptyTitle} subtitle={copy.emptyBody} />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
