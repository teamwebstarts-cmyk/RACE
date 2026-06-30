import React from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';

import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { PartnerRole } from '../../store/partnerOnboardingStore';

interface PartnerRoleCardProps {
  role: PartnerRole;
  title: string;
  description: string;
  badge: string;
  illustration: ImageSourcePropType;
  accentColor: string;
  idleBackground: string;
  idleBorder: string;
  selected: boolean;
  onPress: () => void;
}

export default function PartnerRoleCard({
  title,
  description,
  badge,
  illustration,
  accentColor,
  idleBackground,
  idleBorder,
  selected,
  onPress,
}: PartnerRoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: selected ? colors.partnerRed : idleBorder,
          backgroundColor: selected ? colors.partnerRedLight : idleBackground,
        },
        pressed && styles.pressed,
      ]}>
      {selected ? (
        <View style={styles.checkWrap}>
          <Check size={14} color={colors.background} strokeWidth={3} />
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.illustrationWrap}>
          <Image source={illustration} style={styles.illustration} resizeMode="contain" />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <ChevronRight size={22} color={accentColor} strokeWidth={2.5} />
      </View>

      <View style={[styles.badge, { backgroundColor: selected ? '#FEE2E2' : `${accentColor}18` }]}>
        <Text style={[styles.badgeText, { color: accentColor }]}>{badge}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },
  checkWrap: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.partnerRed,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  illustrationWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: 72,
    height: 72,
  },
  copy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.dark,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.normal,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
