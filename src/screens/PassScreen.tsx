import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getScreenCopy } from '../screenCopy';
import { BrandLogo, Card, EmptyState, styles } from '../ui';
import { t, type Locale } from '../i18n';

export function PassScreen({ locale }: { locale: Locale }) {
  const copy = getScreenCopy(locale).pass;

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={localStyles.heroHeader}>
          <View style={localStyles.heroTopRow}>
            <View style={localStyles.brandBlock}>
              <BrandLogo compact />
              <View style={localStyles.brandCopy}>
                <Text style={localStyles.heroKicker}>{copy.eyebrow}</Text>
                <Text style={localStyles.heroMiniTitle}>{copy.title}</Text>
              </View>
            </View>
            <View style={localStyles.livePill}>
              <View style={localStyles.liveDot} />
              <Text style={localStyles.liveText}>{t(locale, 'common.live')}</Text>
            </View>
          </View>

          <View style={localStyles.statusBanner}>
            <View style={localStyles.statusLeft}>
              <View style={localStyles.statusDot} />
              <View style={localStyles.statusCopy}>
                <Text style={localStyles.statusTitle}>{copy.accessTitle}</Text>
                <Text style={localStyles.statusSubtitle}>{copy.accessSubtitle}</Text>
              </View>
            </View>
            <View style={localStyles.nfcBadge}>
              <Ionicons name="radio-outline" size={14} color="#9df5ff" />
              <Text style={localStyles.nfcText}>NFC Broadcast 13.56 MHz</Text>
            </View>
          </View>
        </View>

        <Card title={copy.accessTitle} subtitle={t(locale, 'common.runtimeState')} wide>
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
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>BLOC</Text>
                <Text style={localStyles.infoValue}>204</Text>
              </View>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>RANG</Text>
                <Text style={localStyles.infoValue}>14</Text>
              </View>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>SIÈGE</Text>
                <Text style={localStyles.infoValue}>28</Text>
              </View>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>CAT.</Text>
                <Text style={localStyles.infoValue}>1 GOLD</Text>
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
              <View style={localStyles.scanLine} />
            </View>

            <View style={localStyles.codeMetaRow}>
              <Text style={localStyles.codeSecurity}>Sécurisé SFMP-Crypt v4</Text>
              <View style={localStyles.timerPill}>
                <Feather name="refresh-cw" size={12} color="#c8f36a" />
                <Text style={localStyles.timerText}>16s</Text>
              </View>
            </View>

            <Text style={localStyles.ticketCode}>TK-9024-8841-MAD</Text>

            <View style={localStyles.barcodeRow}>
              {Array.from({ length: 18 }).map((_, index) => (
                <View key={index} style={[localStyles.barcodeBar, index % 4 === 0 && localStyles.barcodeBarWide]} />
              ))}
            </View>

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

        <View style={localStyles.sectionHeader}>
          <View style={localStyles.sectionTitleRow}>
            <Feather name="navigation" size={14} color="#9df5ff" />
            <Text style={localStyles.sectionTitle}>Accès & Orientation Stade</Text>
          </View>
          <Text style={localStyles.sectionSubtitle}>PORTE 12 · SECTEUR NORD</Text>
        </View>

        <Card title="Flux d'accès" subtitle="Navette Metro L7 · 4 min" wide>
          <View style={localStyles.accessHero}>
            <View style={localStyles.accessHeroLeft}>
              <Text style={localStyles.accessHeroLabel}>Flux Fluide</Text>
              <Text style={localStyles.accessHeroValue}>Porte 12 prête</Text>
            </View>
            <View style={localStyles.accessHeroBadge}>
              <Text style={localStyles.accessHeroBadgeText}>Flux Fluide</Text>
            </View>
          </View>

          <View style={localStyles.timeline}>
            <View style={localStyles.timelineStep}>
              <View style={localStyles.timelineDotActive} />
              <Text style={localStyles.timelineLabel}>Métro</Text>
            </View>
            <View style={localStyles.timelineLine} />
            <View style={localStyles.timelineStep}>
              <View style={localStyles.timelineDot} />
              <Text style={localStyles.timelineLabel}>Fouille Rapide</Text>
            </View>
            <View style={localStyles.timelineLine} />
            <View style={localStyles.timelineStep}>
              <View style={localStyles.timelineDot} />
              <Text style={localStyles.timelineLabel}>Porte 12</Text>
            </View>
          </View>

          <View style={localStyles.accessGrid}>
            <View style={localStyles.accessItem}>
              <Text style={localStyles.accessLabel}>FOUILLE 2</Text>
              <Text style={localStyles.accessValue}>Coupe-File</Text>
              <Text style={localStyles.accessMeta}>Cat. 1 Exclusif</Text>
            </View>
            <View style={localStyles.accessItem}>
              <Text style={localStyles.accessLabel}>CONSIGNE</Text>
              <Text style={localStyles.accessValue}>Casier P3</Text>
              <Text style={localStyles.accessMeta}>Code #4821</Text>
            </View>
            <View style={localStyles.accessItem}>
              <Text style={localStyles.accessLabel}>NIVEAU</Text>
              <Text style={localStyles.accessValue}>Étage 2</Text>
              <Text style={localStyles.accessMeta}>Accès Escalier G</Text>
            </View>
          </View>

          <Text style={localStyles.reserveNote}>Locker P3 réservé à 60m</Text>
        </Card>

        <Card title="Assistance Tour de Match" subtitle="Volontaires SFMP · Réponse immédiate" wide>
          <View style={localStyles.supportRow}>
            <View style={localStyles.supportLeft}>
              <Feather name="headphones" size={18} color="#9df5ff" />
              <View style={localStyles.supportTextBlock}>
                <Text style={localStyles.supportTitle}>Volontaires SFMP</Text>
                <Text style={localStyles.supportSubtitle}>Réponse immédiate sur l’accès</Text>
              </View>
            </View>
            <View style={localStyles.sosButton}>
              <Text style={localStyles.sosText}>SOS ACCÈS</Text>
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
  heroHeader: {
    gap: 12,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  heroKicker: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroMiniTitle: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    lineHeight: 22,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(11, 18, 32, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.16)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c8f36a',
  },
  liveText: {
    color: '#c8f36a',
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(11, 18, 32, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.14)',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c8f36a',
    shadowColor: '#c8f36a',
    shadowOpacity: 0.85,
    shadowRadius: 8,
  },
  statusCopy: { flex: 1, minWidth: 0, gap: 2 },
  statusTitle: {
    color: '#f8fbff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
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
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 211, 238, 0.8)',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.8,
    shadowRadius: 10,
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
  codeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  codeSecurity: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 243, 106, 0.08)',
  },
  timerText: {
    color: '#c8f36a',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },
  ticketCode: {
    color: '#cbd5e1',
    fontFamily: 'SpaceMono-Regular',
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 1.4,
  },
  barcodeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 2,
    paddingVertical: 2,
  },
  barcodeBar: {
    width: 4,
    height: 34,
    borderRadius: 2,
    backgroundColor: '#f8fbff',
    opacity: 0.8,
  },
  barcodeBarWide: {
    width: 7,
    height: 40,
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
  sectionHeader: {
    gap: 4,
    paddingHorizontal: 2,
    paddingTop: 2,
    marginTop: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  sectionSubtitle: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accessHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  accessHeroLeft: { flex: 1, gap: 2 },
  accessHeroLabel: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  accessHeroValue: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  accessHeroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 243, 106, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 106, 0.16)',
  },
  accessHeroBadgeText: {
    color: '#d9ff6f',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 12,
  },
  timelineStep: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#24304c',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#c8f36a',
    shadowColor: '#c8f36a',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  timelineLabel: {
    color: '#f8fbff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    textAlign: 'center',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(157, 245, 255, 0.14)',
    borderRadius: 999,
  },
  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accessItem: {
    flexGrow: 1,
    minWidth: '31%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  accessLabel: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  accessValue: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  accessMeta: {
    color: '#9df5ff',
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  reserveNote: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  supportTextBlock: { flex: 1, minWidth: 0, gap: 2 },
  supportTitle: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  supportSubtitle: {
    color: '#9fb2cb',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  sosButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#d9ff6f',
  },
  sosText: {
    color: '#08111f',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    letterSpacing: 0.6,
  },
});

export default PassScreen;
