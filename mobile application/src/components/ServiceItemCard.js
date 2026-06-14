import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

export default function ServiceItemCard({
  service,
  accent,
  disabled,
  onPress,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: accent },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <Text style={[styles.label, disabled && styles.disabledText]}>
          {service.label}
        </Text>
        {service.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {service.description}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.action, disabled && styles.disabledAction]}>
        {disabled ? 'Soon' : '›'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
  },
  pressed: {
    backgroundColor: colors.backgroundSoft,
  },
  disabled: {
    opacity: 0.7,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    marginBottom: 4,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: typography.lineHeights.tight,
  },
  disabledText: {
    color: colors.text,
  },
  action: {
    fontSize: typography.sizes.xl,
    color: colors.primary,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  disabledAction: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
