import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getScreenCopy } from '../screenCopy';
import { Card, EmptyState, styles } from '../ui';
import { t, type Locale } from '../i18n';

export function PassScreen({ locale }: { locale: Locale }) {
  const copy = getScreenCopy(locale).pass;
  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>
        <Card title={copy.accessTitle} subtitle={copy.accessSubtitle} wide>
          <View style={styles.passCard}>
            <View style={styles.passHeader}>
              <View style={styles.passIcon}>
                <Ionicons name="ticket-outline" size={20} color="#fff" />
              </View>
              <View style={styles.passHeaderContent}>
                <Text style={styles.passKicker}>{copy.eyebrow}</Text>
                <Text style={styles.passTitle}>{copy.cardTitle}</Text>
              </View>
            </View>
            <Text style={styles.passMeta}>{copy.cardBody}</Text>
            <View style={styles.bulletRow}>
              <Feather name="shield" size={16} color="#cbd5e1" />
              <Text style={styles.mutedLight}>{copy.bulletOne}</Text>
            </View>
            <View style={styles.bulletRow}>
              <Feather name="map-pin" size={16} color="#cbd5e1" />
              <Text style={styles.mutedLight}>{copy.bulletTwo}</Text>
            </View>
          </View>
        </Card>
        <Card title={copy.emptyTitle} subtitle={t(locale, 'common.runtimeState')}>
          <EmptyState icon="document-lock-outline" title={copy.emptyTitle} subtitle={copy.emptyBody} />
        </Card>
      </ScrollView>
    </View>
  );
}
