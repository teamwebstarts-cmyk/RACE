import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  dark?: boolean;
}

export default function FormField({ label, error, dark = false, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
      <TextInput
        style={[styles.input, dark && styles.inputDark, style]}
        placeholderTextColor={dark ? colors.subtext : colors.textMuted}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  labelDark: {
    color: colors.textLight,
  },
  input: {
    height: 52,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textDark,
    backgroundColor: colors.backgroundSoft,
  },
  inputDark: {
    color: colors.textLight,
    backgroundColor: colors.card,
    borderColor: colors.glass.border,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: typography.sizes.sm,
  },
});
