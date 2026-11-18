import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function Card({ title, subtitle, children, wide = false }: { title: string; subtitle: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <View style={[styles.card, wide && styles.cardWide]}>
      <Text style={styles.cardKicker}>{subtitle}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

export function MiniCard({ title, subtitle, meta }: { title: string; subtitle: string; meta: string }) {
  return (
    <View style={styles.miniCard}>
      <Text style={styles.miniCardTitle}>{title}</Text>
      <Text style={styles.muted}>{subtitle}</Text>
      <Text style={styles.miniCardMeta}>{meta}</Text>
    </View>
  );
}

export function Row({ leftTitle, leftSubtitle, rightTitle, rightSubtitle }: { leftTitle: string; leftSubtitle: string; rightTitle: string; rightSubtitle: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>{leftTitle}</Text>
        <Text style={styles.muted}>{leftSubtitle}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowTitle}>{rightTitle}</Text>
        <Text style={styles.muted}>{rightSubtitle}</Text>
      </View>
    </View>
  );
}

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.dot} />
      <Text style={styles.muted}>{children}</Text>
    </View>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function Pill({ children, subtle = false }: { children: React.ReactNode; subtle?: boolean }) {
  return <Text style={[styles.pill, subtle && styles.pillSubtle]}>{children}</Text>;
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f8fc' },
  container: { padding: 18, gap: 14, backgroundColor: '#f6f8fc' },
  header: { padding: 20, borderRadius: 24, backgroundColor: '#101b2d', gap: 10 },
  kicker: { color: '#94a3b8', letterSpacing: 1.2, fontSize: 12, fontWeight: '700' },
  title: { color: '#ffffff', fontSize: 31, lineHeight: 36, fontWeight: '800' },
  subtitle: { color: '#cbd5e1', fontSize: 15, lineHeight: 22 },
  heroCard: { padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', gap: 12 },
  heroRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  card: { padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', gap: 10 },
  cardWide: { width: '100%' },
  cardBody: { gap: 12 },
  cardKicker: { color: '#66758f', textTransform: 'uppercase', letterSpacing: 1, fontSize: 11, fontWeight: '700' },
  cardTitle: { color: '#172033', fontSize: 20, fontWeight: '800' },
  cardTitleDark: { color: '#fff', fontSize: 20, fontWeight: '800' },
  muted: { color: '#60708b' },
  mutedLight: { color: '#aeb8cb' },
  pill: { backgroundColor: '#101b2d', color: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontSize: 12, fontWeight: '700' },
  pillSubtle: { backgroundColor: '#edf2ff', color: '#1d3fb3' },
  statsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statBox: { flexGrow: 1, flexBasis: '30%', padding: 12, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e6eaf0' },
  statLabel: { color: '#60708b', fontSize: 12 },
  statValue: { color: '#101b2d', fontSize: 16, fontWeight: '800', marginTop: 4 },
  ctaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  primaryButton: { backgroundColor: '#2457e6', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#eef2ff', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14 },
  secondaryButtonText: { color: '#1d3fb3', fontWeight: '700' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  miniCard: { flexBasis: '48%', flexGrow: 1, padding: 14, borderRadius: 18, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e6eaf0', gap: 4 },
  miniCardTitle: { color: '#101b2d', fontSize: 15, fontWeight: '800' },
  miniCardMeta: { color: '#101b2d', fontWeight: '700', marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowLeft: { flex: 1 },
  rowTitle: { color: '#101b2d', fontSize: 15, fontWeight: '700' },
  rowRight: { alignItems: 'flex-end' },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#2457e6' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  passCard: { padding: 18, borderRadius: 20, backgroundColor: '#101b2d', gap: 10 },
  passKicker: { color: '#94a3b8', fontSize: 12, letterSpacing: 1.2, fontWeight: '700' },
  passTitle: { color: '#ffffff', fontSize: 24, lineHeight: 30, fontWeight: '800' },
  passMeta: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
  qrMock: { height: 160, borderRadius: 16, backgroundColor: '#e5edff' },
  mapPanel: { minHeight: 240, borderRadius: 18, backgroundColor: '#edf2ff', borderWidth: 1, borderColor: '#dbe4ff', overflow: 'hidden', justifyContent: 'flex-end' },
  darkMap: { minHeight: 280, borderRadius: 18, backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1b273a', overflow: 'hidden', justifyContent: 'flex-end' },
  mapOverlay: { padding: 16, backgroundColor: 'rgba(255,255,255,0.84)' },
  mapOverlayCard: { margin: 16, padding: 16, borderRadius: 16, backgroundColor: 'rgba(11,18,32,0.78)', borderWidth: 1, borderColor: '#1b273a' },
  routeLine: { position: 'absolute', left: '18%', top: '55%', width: '64%', height: 6, borderRadius: 999, backgroundColor: '#2457e6' },
  routeNodeStart: { position: 'absolute', left: '16%', top: '50%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#c8f36a' },
  routeNodeMid: { position: 'absolute', left: '50%', top: '47%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#2457e6' },
  routeNodeEnd: { position: 'absolute', left: '82%', top: '50%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#c8f36a' },
  mapDot1: { position: 'absolute', top: '18%', left: '20%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#2457e6' },
  mapDot2: { position: 'absolute', top: '36%', left: '55%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#c8f36a' },
  mapDot3: { position: 'absolute', top: '68%', left: '74%', width: 18, height: 18, borderRadius: 999, backgroundColor: '#2457e6' },
  tabLabel: { fontSize: 11, fontWeight: '700' },
});
