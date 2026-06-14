import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

export default function HighlightCard({ item }) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.value}>{item.value}</Text>
      <Text style={styles.label}>{item.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  icon: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.textDark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extrabold,
    marginBottom: 2,
  },
  label: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.tight,
  },
});
