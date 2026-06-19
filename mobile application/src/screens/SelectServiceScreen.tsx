import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/ui/PrimaryButton';
import BrandLogo from '../components/ui/BrandLogo';
import Screen, { ScreenContent } from '../components/ui/Screen';
import type { HomeStackParamList } from '../types/navigation';
import { brand, colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'SelectService'>;

export default function SelectServiceScreen({ navigation, route }: Props) {
  const { categoryId, serviceId, serviceLabel, serviceDescription } = route.params;

  const handleBook = () => {
    navigation.navigate('BookingFlow', {
      categoryId,
      serviceId,
      serviceLabel,
      serviceDescription,
    });
  };

  const handleCall = () => {
    Linking.openURL(`tel:${brand.phoneRaw}`);
  };

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
              Available 24/7 across Bhubaneswar and Odisha. Book in-app or call now.
            </Text>
            <PrimaryButton label="Book Now" onPress={handleBook} />
            <Pressable onPress={handleCall} style={styles.callLink}>
              <Text style={styles.callText}>Or call {brand.phone}</Text>
            </Pressable>
          </View>
        </ScreenContent>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'center' },
  hero: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 20,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  logo: { marginBottom: spacing.lg },
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
  callLink: { marginTop: spacing.md },
  callText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
