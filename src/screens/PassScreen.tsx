import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
          <View style={localStyles.activeBanner}>
            <View style={localStyles.activeDot} />
            <Text style={localStyles.activeText}>{copy.accessTitle}</Text>
            <View style={localStyles.nfcBadge}>
              <Ionicons name="radio-outline" size={14} color="#9df5ff" />
              <Text style={localStyles.nfcText}>NFC LIVE</Text>
            </View>
          </View>

          <View style={localStyles.passCard}>
            <View style={styles.rowBetween}>
              <View style={localStyles.badgePill}>
                <Feather name="award" size={12} color="#0b1220" />
                <Text style={localStyles.badgeText}>UCL FINAL 2025</Text>
              </View>
              <View style={localStyles.badgePillSoft}>
                <Text style={localStyles.badgeSoftText}>CAT. 1 GOLD</Text>
              </View>
            </View>

            <View style={localStyles.matchHero}>
              <View style={localStyles.teamBlock}>
                <Text style={localStyles.teamTitle}>Real Madrid</Text>
                <Text style={localStyles.teamMeta}>Hôte officiel</Text>
              </View>
              <Text style={localStyles.vs}>VS</Text>
              <View style={localStyles.teamBlockRight}>
                <Text style={localStyles.teamTitle}>Paris SG</Text>
                <Text style={localStyles.teamMeta}>Visiteur</Text>
              </View>
            </View>

            <View style={localStyles.infoGrid}>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>DATE</Text>
                <Text style={localStyles.infoValue}>Sam. 31 Mai 2025</Text>
              </View>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>KO</Text>
                <Text style={localStyles.infoValue}>21:00</Text>
              </View>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>STADE</Text>
                <Text style={localStyles.infoValue}>Metropolitano</Text>
              </View>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>PORTE</Text>
                <Text style={localStyles.infoValue}>12</Text>
              </View>
            </View>

            <View style={localStyles.ticketLine}>
              <View style={localStyles.ticketDot} />
              <Text style={localStyles.ticketLineText}>Approchez le mobile de la borne</Text>
              <View style={localStyles.ticketDot} />
            </View>

            <View style={localStyles.qrFrame}>
              <View style={localStyles.qrCornerTopLeft} />
              <View style={localStyles.qrCornerTopRight} />
              <View style={localStyles.qrCornerBottomLeft} />
              <View style={localStyles.qrCornerBottomRight} />
              <View style={localStyles.qrGlow} />
              <View style={localStyles.qrMark} />
            </View>

            <Text style={localStyles.ticketCode}>TK-9024-8841-MAD</Text>
            <View style={localStyles.ticketFooter}>
              <Text style={localStyles.ticketFooterText}>Titulaire : Alexandre Laurent</Text>
              <Text style={localStyles.ticketFooterText}>N° 084920</Text>
            </View>
          </View>

          <View style={styles.ctaRow}>
            <View style={localStyles.secondaryAction}>
              <Feather name="smartphone" size={16} color="#cbd5e1" />
              <Text style={localStyles.secondaryActionText}>Apple Wallet</Text>
            </View>
            <View style={localStyles.secondaryAction}>
              <Feather name="share-2" size={16} color="#cbd5e1" />
              <Text style={localStyles.secondaryActionText}>Partager Pass</Text>
            </View>
          </View>
        </Card>

        <Card title={copy.emptyTitle} subtitle={t(locale, 'common.runtimeState')} wide>
          <EmptyState icon="document-lock-outline" title={copy.emptyTitle} subtitle={copy.emptyBody} />
        </Card>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(201, 243, 106, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.18)',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c8f36a',
    shadowColor: '#c8f36a',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  activeText: {
    flex: 1,
    color: '#d9ff6f',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nfcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 22, 38, 0.9)',
  },
  nfcText: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },
  passCard: {
    gap: 14,
    padding: 18,
    borderRadius: 28,
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#d9ff6f',
  },
  badgeText: {
    color: '#08111f',
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
  },
  badgePillSoft: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.16)',
  },
  badgeSoftText: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },
  matchHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  teamBlock: {
    flex: 1,
    gap: 2,
  },
  teamBlockRight: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-end',
  },
  teamTitle: {
    color: '#f8fbff',
    fontFamily: 'Oswald-Bold',
    fontSize: 30,
    lineHeight: 34,
  },
  teamMeta: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  vs: {
    color: '#22d3ee',
    fontFamily: 'Oswald-Bold',
    fontSize: 28,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    flexGrow: 1,
    minWidth: '45%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  infoValue: {
    color: '#f8fbff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  ticketLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  ticketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22d3ee',
  },
  ticketLineText: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qrFrame: {
    height: 220,
    borderRadius: 26,
    backgroundColor: '#0a1020',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.18)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrGlow: {
    width: 150,
    height: 150,
    borderRadius: 20,
    borderWidth: 16,
    borderColor: 'rgba(201, 243, 106, 0.92)',
    borderTopColor: 'rgba(201, 243, 106, 0.25)',
    borderLeftColor: 'rgba(201, 243, 106, 0.36)',
    transform: [{ rotate: '45deg' }],
    opacity: 0.9,
  },
  qrMark: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 8,
    borderColor: 'rgba(34, 211, 238, 0.88)',
    backgroundColor: 'rgba(8, 14, 26, 0.1)',
  },
  qrCornerTopLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderTopWidth: 8,
    borderLeftWidth: 8,
    borderColor: '#c8f36a',
    borderTopLeftRadius: 16,
  },
  qrCornerTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderColor: '#c8f36a',
    borderTopRightRadius: 16,
  },
  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 44,
    height: 44,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderColor: '#c8f36a',
    borderBottomLeftRadius: 16,
  },
  qrCornerBottomRight: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderColor: '#c8f36a',
    borderBottomRightRadius: 16,
  },
  ticketCode: {
    color: '#cbd5e1',
    fontFamily: 'SpaceMono-Regular',
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 1.4,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  ticketFooterText: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#111a2e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  secondaryActionText: {
    color: '#f8fbff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
});
