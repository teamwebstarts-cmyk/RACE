import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Phone } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppScreenLayout from '../components/ui/AppScreenLayout';
import type { HomeStackParamList } from '../types/navigation';
import { brand, colors, radius, shadows, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'SelectService'>;

export default function SelectServiceScreen({ route }: Props) {
  const { serviceLabel, serviceDescription } = route.params;

  const handleBook = () => {
    void Linking.openURL(`tel:${brand.phoneRaw}`);
  };

  return (
    <AppScreenLayout backgroundColor={colors.pageBg} contentStyle={styles.content}>
      <View style={[styles.card, shadows.card]}>
        <Text style={styles.kicker}>Book with {brand.name}</Text>
        <Text style={styles.title}>{serviceLabel}</Text>
        {serviceDescription ? <Text style={styles.description}>{serviceDescription}</Text> : null}
        <Text style={styles.subtitle}>
          Available 24/7 across Bhubaneswar and Odisha. Call now to confirm your booking, or use
          Home for full in-app booking flows.
        </Text>

        <Pressable
          onPress={handleBook}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Phone size={18} color={colors.dark} strokeWidth={2.4} />
          <Text style={styles.ctaLabel}>Call to book</Text>
        </Pressable>
        <Text style={styles.phone}>{brand.phone}</Text>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  kicker: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.dark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.grey,
    lineHeight: typography.lineHeights.normal,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.grey,
    lineHeight: typography.lineHeights.normal,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignSelf: 'stretch',
  },
  ctaLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
  },
  phone: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  pressed: { opacity: 0.92 },
});
