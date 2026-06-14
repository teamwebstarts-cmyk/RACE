import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

export default function FeatureList({ features }) {
  return (
    <View style={styles.wrap}>
      {features.map(feature => (
        <View key={feature} style={styles.item}>
          <View style={styles.dot} />
          <Text style={styles.text}>{feature}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.md,
  },
  text: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.normal,
  },
});
