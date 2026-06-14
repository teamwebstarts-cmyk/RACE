import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, getCategoryTheme, radius, spacing, typography } from '../theme';
import ServiceIcon from './ui/ServiceIcon';

export default function ServiceCategoryCard({ category, onPress }) {
  const theme = getCategoryTheme(category.id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background },
        pressed && styles.pressed,
      ]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: theme.iconBackground }]}>
          <ServiceIcon categoryId={category.id} emoji={category.icon} size={26} />
        </View>
        {category.comingSoon ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Soon</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { color: theme.accent }]}>{category.title}</Text>
      {category.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {category.description}
        </Text>
      ) : null}
      <Text style={styles.count}>
        {category.services.length} service
        {category.services.length === 1 ? '' : 's'}
      </Text>
      <View style={[styles.accentBar, { backgroundColor: theme.accent }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 168,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    lineHeight: typography.lineHeights.tight,
    marginBottom: spacing.xs,
  },
  count: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  accentBar: {
    height: 3,
    width: 28,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
});
