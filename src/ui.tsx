import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extrabold: 'Poppins-ExtraBold',
  display: 'Oswald-Regular',
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
        <Ionicons name={icon} size={24} color="#06B6D4" />
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

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brandLogoWrap, compact && styles.brandLogoWrapCompact]}>
      <Image source={require('../assets/logo.png')} style={[styles.brandLogo, compact && styles.brandLogoCompact]} resizeMode="contain" />
    </View>
  );
}

export function AvatarPhoto({ uri, label, size = 44 }: { uri?: string | null; label: string; size?: number }) {
  const initials = label
    .split(/\s+/)
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const radius = Math.round(size / 2);
  return (
    <View style={[styles.avatarPhoto, { width: size, height: size, borderRadius: radius }]}>
      {uri ? <Image source={{ uri }} style={[styles.avatarPhotoImage, { width: size, height: size, borderRadius: radius }]} /> : <Text style={styles.avatarPhotoFallback}>{initials}</Text>}
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
  safeArea: { flex: 1, backgroundColor: '#070d18' },
  container: { gap: 14, backgroundColor: '#eef3fb' },
  header: {
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  kicker: {
    color: '#000000',
    letterSpacing: 1.2,
    fontSize: 12,
    fontFamily: fonts.display,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 36,
    fontFamily: fonts.bold,
  },
  subtitle: {
    color: '#333333',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.display,
  },
  heroCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#0f1728',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderTopWidth: 4,
    borderTopColor: '#22d3ee',
    gap: 12,
    shadowColor: '#0b1424',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  card: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#0f1728',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    borderTopWidth: 4,
    borderTopColor: '#22d3ee',
    gap: 10,
    shadowColor: '#0b1424',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardWide: { width: '100%' },
  cardBody: { gap: 12 },
  cardKicker: {
    color: '#66758f',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    fontFamily: fonts.display,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fonts.display,
    flexShrink: 1,
    minWidth: 0,
  },
  cardTitleDark: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fonts.display,
    flexShrink: 1,
    minWidth: 0,
  },
  muted: { color: '#9fb2cb', fontFamily: fonts.regular },
  mutedLight: { color: '#aeb8cb', fontFamily: fonts.regular },
  pill: {
    backgroundColor: '#101b2d',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  pillSubtle: { backgroundColor: '#8B5CF6', color: '#f8fafc' },
  statsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statBox: {
    flexGrow: 1,
    flexBasis: '30%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
  },
  statLabel: { color: '#9fb2cb', fontSize: 12, fontFamily: fonts.medium },
  statValue: {
    color: '#101b2d',
    fontSize: 16,
    fontFamily: fonts.display,
    marginTop: 4,
  },
  ctaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: { width: 18, alignItems: 'center' },
  secondaryButtonIcon: { width: 18, alignItems: 'center' },
  primaryButton: {
    backgroundColor: '#09111f',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  primaryButtonText: { color: '#fff', fontFamily: fonts.bold },
  secondaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  secondaryButtonText: { color: '#f8fafc', fontFamily: fonts.bold },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    backgroundColor: '#0f1728',
    color: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.medium,
  },
  errorText: { color: '#b91c1c', fontFamily: fonts.display },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  miniCard: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
    gap: 4,
  },
  miniCardTitle: {
    color: '#101b2d',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: fonts.display,
    flexShrink: 1,
    minWidth: 0,
  },
  miniCardMeta: { color: '#101b2d', fontFamily: fonts.display, marginTop: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rowLeft: { flex: 1, minWidth: 0 },
  rowRight: { alignItems: 'flex-end' },
  rowTitle: {
    color: '#101b2d',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: fonts.display,
    flexShrink: 1,
    minWidth: 0,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#8B5CF6' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabChip: {
    backgroundColor: '#edf2ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
  },
  tabChipActive: { backgroundColor: '#8B5CF6', borderColor: '#020B2D' },
  tabChipText: { color: '#09111f', fontFamily: fonts.display },
  tabChipTextActive: { color: '#f8fafc' },
  langChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
  },
  langChipActive: { backgroundColor: '#101b2d', borderColor: '#101b2d' },
  langChipText: { color: '#9fb2cb', fontFamily: fonts.display, fontSize: 12 },
  langChipTextActive: { color: '#fff' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  helperText: {
    color: '#020B2D',
    fontSize: 12,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  brandLogoWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandLogoWrapCompact: { marginBottom: 0 },
  brandLogo: { width: 50 },
  brandLogoCompact: { width: 50 },
  avatarPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  avatarPhotoImage: { backgroundColor: '#f8fafc' },
  avatarPhotoFallback: {
    color: '#fff',
    fontFamily: fonts.extrabold,
    fontSize: 14,
  },
  passCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#101b2d',
    gap: 10,
    borderWidth: 1,
    borderColor: '#1c2a44',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  passHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  passHeaderContent: { flex: 1 },
  passIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2740',
  },
  passKicker: {
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 1.2,
    fontFamily: fonts.display,
  },
  passTitle: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.display,
  },
  passMeta: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  mapPanel: {
    minHeight: 240,
    borderRadius: 24,
    backgroundColor: '#09111f',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  mapView: { height: 290 },
  mapOverlay: {
    padding: 16,
    backgroundColor: 'rgba(7, 12, 24, 0.84)',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(124, 243, 160, 0.16)',
  },
  emptyStateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f1728',
  },
  emptyStateTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontFamily: fonts.display,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#9fb2cb',
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});
