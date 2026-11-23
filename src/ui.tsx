import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extrabold: 'Poppins-ExtraBold',
};

export function Card({ title, subtitle, children, wide = false }: { title: string; subtitle: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <View style={[styles.card, wide && styles.cardWide]}>
      <Text style={styles.cardKicker}>{subtitle}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

export function EmptyState({ title, subtitle, icon = 'cloud-offline-outline' }: { title: string; subtitle: string; icon?: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name={icon} size={24} color="#2457e6" />
      </View>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
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

export function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: React.ReactNode }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <View style={styles.buttonContent}>
        {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
        <Text style={styles.primaryButtonText}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: React.ReactNode }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <View style={styles.buttonContent}>
        {icon ? <View style={styles.secondaryButtonIcon}>{icon}</View> : null}
        <Text style={styles.secondaryButtonText}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#94a3b8"
      style={styles.input}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
    />
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.errorText}>{children}</Text>;
}

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f8fc' },
  container: { padding: 18, gap: 14, backgroundColor: '#f6f8fc' },
  header: { padding: 20, borderRadius: 24, backgroundColor: '#101b2d', gap: 10 },
  kicker: { color: '#94a3b8', letterSpacing: 1.2, fontSize: 12, fontFamily: fonts.bold },
  title: { color: '#ffffff', fontSize: 31, lineHeight: 36, fontFamily: fonts.extrabold },
  subtitle: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, fontFamily: fonts.regular },
  heroCard: { padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cfe58a', borderTopWidth: 4, borderTopColor: '#c8f36a', gap: 12 },
  heroRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  card: { padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', gap: 10 },
  cardWide: { width: '100%' },
  cardBody: { gap: 12 },
  cardKicker: { color: '#66758f', textTransform: 'uppercase', letterSpacing: 1, fontSize: 11, fontFamily: fonts.bold },
  cardTitle: { color: '#172033', fontSize: 20, fontFamily: fonts.extrabold },
  cardTitleDark: { color: '#fff', fontSize: 20, fontFamily: fonts.extrabold },
  muted: { color: '#60708b', fontFamily: fonts.regular },
  mutedLight: { color: '#aeb8cb', fontFamily: fonts.regular },
  pill: { backgroundColor: '#101b2d', color: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontSize: 12, fontFamily: fonts.bold },
  pillSubtle: { backgroundColor: '#c8f36a', color: '#172033' },
  statsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statBox: { flexGrow: 1, flexBasis: '30%', padding: 12, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e6eaf0' },
  statLabel: { color: '#60708b', fontSize: 12, fontFamily: fonts.medium },
  statValue: { color: '#101b2d', fontSize: 16, fontFamily: fonts.extrabold, marginTop: 4 },
  ctaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonIcon: { width: 18, alignItems: 'center' },
  secondaryButtonIcon: { width: 18, alignItems: 'center' },
  primaryButton: { backgroundColor: '#2457e6', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14 },
  primaryButtonText: { color: '#fff', fontFamily: fonts.bold },
  secondaryButton: { backgroundColor: '#d7ff2f', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14 },
  secondaryButtonText: { color: '#172033', fontFamily: fonts.bold },
  input: { borderWidth: 1, borderColor: '#dbe4ff', backgroundColor: '#fff', color: '#172033', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.medium },
  errorText: { color: '#b91c1c', fontFamily: fonts.bold },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  miniCard: { flexBasis: '48%', flexGrow: 1, padding: 14, borderRadius: 18, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e6eaf0', gap: 4 },
  miniCardTitle: { color: '#101b2d', fontSize: 15, fontFamily: fonts.extrabold },
  miniCardMeta: { color: '#101b2d', fontFamily: fonts.bold, marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowLeft: { flex: 1 },
  rowRight: { alignItems: 'flex-end' },
  rowTitle: { color: '#101b2d', fontSize: 15, fontFamily: fonts.bold },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#c8f36a' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabChip: { backgroundColor: '#edf2ff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#dbe4ff' },
  tabChipActive: { backgroundColor: '#c8f36a', borderColor: '#c8f36a' },
  tabChipText: { color: '#1d3fb3', fontFamily: fonts.bold },
  tabChipTextActive: { color: '#172033' },
  langChip: { backgroundColor: '#f8fafc', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#dbe4ff' },
  langChipActive: { backgroundColor: '#101b2d', borderColor: '#101b2d' },
  langChipText: { color: '#60708b', fontFamily: fonts.bold, fontSize: 12 },
  langChipTextActive: { color: '#fff' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  helperText: { color: '#60708b', fontSize: 12, fontFamily: fonts.medium, textAlign: 'center' },
  passCard: { padding: 18, borderRadius: 20, backgroundColor: '#101b2d', gap: 10 },
  passHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  passHeaderContent: { flex: 1 },
  passIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a2740' },
  passKicker: { color: '#94a3b8', fontSize: 12, letterSpacing: 1.2, fontFamily: fonts.bold },
  passTitle: { color: '#ffffff', fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold },
  passMeta: { color: '#cbd5e1', fontSize: 14, lineHeight: 20, fontFamily: fonts.regular },
  mapPanel: {
    minHeight: 240,
    borderRadius: 24,
    backgroundColor: '#09111f',
    borderWidth: 1,
    borderColor: '#23395c',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  mapView: { height: 290 },
  mapOverlay: { padding: 16, backgroundColor: 'rgba(7, 12, 24, 0.84)', gap: 4, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  emptyState: { alignItems: 'center', gap: 8, padding: 18, borderRadius: 18, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e6eaf0' },
  emptyStateIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#efffd0' },
  emptyStateTitle: { color: '#172033', fontSize: 16, fontFamily: fonts.extrabold, textAlign: 'center' },
  emptyStateSubtitle: { color: '#60708b', fontFamily: fonts.regular, textAlign: 'center', lineHeight: 20 },
});
