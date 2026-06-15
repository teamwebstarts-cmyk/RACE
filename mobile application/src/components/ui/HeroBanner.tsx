import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';
import type { Brand } from '../../types/models';
import BrandLogo from './BrandLogo';

interface HeroBannerProps {
  brand: Brand;
}

export default function HeroBanner({ brand }: HeroBannerProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.topRow}>
        <BrandLogo size="large" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>24/7 {brand.productName}</Text>
        </View>
      </View>

      <Text style={styles.brand}>{brand.name}</Text>
      <Text style={styles.tagline}>{brand.tagline}</Text>
      <Text style={styles.description}>{brand.description}</Text>

      <View style={styles.accentLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.textDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  brand: {
    color: colors.textLight,
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.extrabold,
    marginBottom: spacing.sm,
  },
  tagline: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeights.relaxed,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.normal,
  },
  accentLine: {
    height: 3,
    width: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
  },
});
