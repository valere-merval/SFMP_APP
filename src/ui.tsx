import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extrabold: 'Poppins-ExtraBold',
  display: 'Teko-Regular',
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
        <Ionicons name={icon} size={24} color="#00e5ff" />
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
      <Image
        source={require('../assets/smart-fan-mobility-logo.jpg')}
        style={[styles.brandLogo, compact && styles.brandLogoCompact]}
        resizeMode="contain"
      />
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
      {uri ? (
        <Image source={{ uri }} style={[styles.avatarPhotoImage, { width: size, height: size, borderRadius: radius }]} />
      ) : (
        <Text style={styles.avatarPhotoFallback}>{initials}</Text>
      )}
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
      placeholderTextColor="#8d97ab"
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
  safeArea: { flex: 1, backgroundColor: '#0e1321' },
  container: {
    gap: 14,
    backgroundColor: '#0a0f1d',
  },
  header: {
    padding: 18,
    backgroundColor: 'rgba(17, 26, 46, 0.94)',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  kicker: {
    color: '#9fd0db',
    letterSpacing: 2,
    fontSize: 12,
    fontFamily: fonts.display,
  },
  title: {
    color: '#f6f8ff',
    fontSize: 34,
    lineHeight: 38,
    fontFamily: fonts.display,
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#bfd0e7',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
  heroCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#111a2e',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.16)',
    borderTopWidth: 4,
    borderTopColor: '#ccff00',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  card: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#111a2e',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
    borderTopWidth: 4,
    borderTopColor: '#ccff00',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardWide: { width: '100%' },
  cardBody: { gap: 12 },
  cardKicker: {
    color: '#8f9ab2',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 11,
    fontFamily: fonts.display,
  },
  cardTitle: {
    color: '#f8fbff',
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fonts.display,
    flexShrink: 1,
    minWidth: 0,
  },
  cardTitleDark: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fonts.display,
    flexShrink: 1,
    minWidth: 0,
  },
  muted: { color: '#b2bfd4', fontFamily: fonts.regular },
  mutedLight: { color: '#d5deeb', fontFamily: fonts.regular },
  pill: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    color: '#effbff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontFamily: fonts.semibold,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
  },
  pillSubtle: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    color: '#dff98a',
    borderColor: 'rgba(204, 255, 0, 0.2)',
  },
  statsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statBox: {
    flexGrow: 1,
    flexBasis: '30%',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
  },
  statLabel: { color: '#8d97ab', fontSize: 12, fontFamily: fonts.medium },
  statValue: {
    color: '#f8fbff',
    fontSize: 18,
    fontFamily: fonts.display,
    marginTop: 4,
    letterSpacing: 0.5,
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
    backgroundColor: '#ccff00',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#ccff00',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryButtonText: { color: '#0a0f1d', fontFamily: fonts.bold },
  secondaryButton: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.24)',
  },
  secondaryButtonText: { color: '#dffbff', fontFamily: fonts.bold },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
    backgroundColor: '#0b1220',
    color: '#f8fbff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.medium,
  },
  errorText: { color: '#ff9b95', fontFamily: fonts.regular },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  miniCard: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
    gap: 4,
  },
  miniCardTitle: {
    color: '#f8fbff',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: fonts.display,
    flexShrink: 1,
    minWidth: 0,
  },
  miniCardMeta: { color: '#cfe1ff', fontFamily: fonts.display, marginTop: 6 },
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
    color: '#f8fbff',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: fonts.display,
    flexShrink: 1,
    minWidth: 0,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#ccff00' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabChip: {
    backgroundColor: '#0b1220',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
  },
  tabChipActive: { backgroundColor: 'rgba(204, 255, 0, 0.16)', borderColor: 'rgba(204, 255, 0, 0.32)' },
  tabChipText: { color: '#b2bfd4', fontFamily: fonts.display },
  tabChipTextActive: { color: '#effbff' },
  langChip: {
    backgroundColor: '#0b1220',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
  },
  langChipActive: { backgroundColor: 'rgba(0, 229, 255, 0.14)', borderColor: 'rgba(0, 229, 255, 0.34)' },
  langChipText: { color: '#8d97ab', fontFamily: fonts.display, fontSize: 12 },
  langChipTextActive: { color: '#f8fbff' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  helperText: {
    color: '#c5d3e8',
    fontSize: 12,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  brandLogoWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  brandLogoWrapCompact: { marginBottom: 0 },
  brandLogo: { width: 56, height: 56 },
  brandLogoCompact: { width: 40, height: 40 },
  avatarPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111a2e',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.28)',
  },
  avatarPhotoImage: { backgroundColor: '#111a2e' },
  avatarPhotoFallback: {
    color: '#f8fbff',
    fontFamily: fonts.extrabold,
    fontSize: 14,
  },
  passCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#111a2e',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
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
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  passKicker: {
    color: '#8f9ab2',
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
    minHeight: 420,
    borderRadius: 28,
    backgroundColor: 'rgba(9, 17, 31, 0.01)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  mapView: { height: 420 },
  mapOverlay: {
    padding: 12,
    backgroundColor: 'rgba(9, 15, 29, 0.01)',
    gap: 4,
    borderTopWidth: 0,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.14)',
  },
  emptyStateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  emptyStateTitle: {
    color: '#f8fbff',
    fontSize: 16,
    fontFamily: fonts.display,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#b2bfd4',
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});
