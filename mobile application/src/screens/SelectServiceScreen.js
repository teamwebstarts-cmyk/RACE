import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../components/ui/PrimaryButton';
import BrandLogo from '../components/ui/BrandLogo';
import Screen, { ScreenContent } from '../components/ui/Screen';
import { brand, colors, spacing, typography } from '../theme';

export default function SelectServiceScreen({ route }) {
  const { serviceLabel, serviceDescription } = route.params;

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea}>
        <ScreenContent style={styles.content}>
          <View style={styles.hero}>
            <BrandLogo size="medium" style={styles.logo} />
            <Text style={styles.kicker}>Book with {brand.name}</Text>
            <Text style={styles.title}>{serviceLabel}</Text>
            {serviceDescription ? (
              <Text style={styles.description}>{serviceDescription}</Text>
            ) : null}
            <Text style={styles.subtitle}>
              Booking flow coming in the next sprint. Live 24/7 support at{' '}
              {brand.phone}.
            </Text>
            <PrimaryButton label="Book Now" disabled />
          </View>
        </ScreenContent>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 20,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  logo: {
    marginBottom: spacing.lg,
  },
  kicker: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.textLight,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.normal,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.normal,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});
