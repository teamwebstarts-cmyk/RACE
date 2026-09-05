import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';
import type { Brand } from '../../types/models';

interface AppHeaderProps {
  brand: Brand;
}

export default function AppHeader({ brand }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.textWrap}>
        <Text style={styles.product}>{brand.productName}</Text>
        <Text style={styles.name}>{brand.name}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>24/7</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  textWrap: {
    flex: 1,
  },
  product: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    color: colors.textLight,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.textDark,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extrabold,
  },
});
