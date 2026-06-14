import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../components/ui/PrimaryButton';
import BrandLogo from '../components/ui/BrandLogo';
import Screen, { ScreenContent } from '../components/ui/Screen';
import { brand, colors, spacing, typography } from '../theme';

export default function PlaceholderScreen({ title, subtitle }) {
  return (
    <Screen>
      <SafeAreaView style={styles.safeArea}>
        <ScreenContent style={styles.content}>
          <View style={styles.card}>
            <BrandLogo size="medium" style={styles.logo} />
            <Text style={styles.badge}>{brand.productName}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <PrimaryButton label="Coming Soon" disabled />
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  logo: {
    marginBottom: spacing.md,
  },
  badge: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.textDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal,
    marginBottom: spacing.xl,
  },
});
