import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  otp?: string;
  title?: string;
  subtitle?: string;
};

export default function TripOtpCard({
  otp,
  title = 'Trip OTP',
  subtitle = 'Share this code with your partner to start the service.',
}: Props) {
  if (!otp) return null;

  const digits = otp.split('');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ShieldCheck size={18} color={colors.primaryDark} strokeWidth={2.2} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.digitsRow}>
        {digits.map((digit, index) => (
          <View key={`${digit}-${index}`} style={styles.digitBox}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.goldLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F5D98A',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
  },
  subtitle: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  digitsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  digitBox: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 2,
  },
});
