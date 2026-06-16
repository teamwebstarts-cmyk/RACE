import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { VENDOR_TYPE_CONFIGS } from '../../data/vendorWizardConfig';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'VendorTypeSelect'>;

export default function SelectVendorTypeScreen({ navigation }: Props) {
  const { data: existingVendor } = useVendorStatusQuery();

  const handleSelect = (vendorType: (typeof VENDOR_TYPE_CONFIGS)[number]['type']) => {
    if (vendorType === 'mechanic') return;
    navigation.navigate('VendorWizard', { vendorType });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Partner With RACE</Text>
        <Text style={styles.subtitle}>Select your account type to begin onboarding</Text>

        {existingVendor && existingVendor.status !== 'draft' ? (
          <GlassCard style={styles.statusCard}>
            <Text style={styles.statusTitle}>Existing Application</Text>
            <Text style={styles.statusText}>
              Status: {existingVendor.status.replace(/_/g, ' ')}
            </Text>
            <PrimaryButton
              label="View Verification Status"
              onPress={() => navigation.navigate('VendorVerificationStatus')}
            />
          </GlassCard>
        ) : null}

        {VENDOR_TYPE_CONFIGS.map((item) => {
          const disabled = item.type === 'mechanic';
          return (
            <TouchableOpacity
              key={item.type}
              onPress={() => handleSelect(item.type)}
              disabled={disabled}
              activeOpacity={0.85}>
              <GlassCard style={[styles.card, disabled && styles.disabled]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Text style={styles.stepsHint}>{item.steps.length} step onboarding</Text>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceDarker },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: {
    color: colors.textLight,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: { color: colors.subtext, marginBottom: spacing.lg, marginTop: spacing.xs },
  statusCard: { marginBottom: spacing.lg },
  statusTitle: { color: colors.textLight, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  statusText: { color: colors.subtext, marginBottom: spacing.md, textTransform: 'capitalize' },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 32 },
  cardText: { flex: 1 },
  cardTitle: { color: colors.textLight, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  cardSubtitle: { color: colors.subtext, marginTop: spacing.xs },
  stepsHint: {
    color: colors.primary,
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  disabled: { opacity: 0.45 },
});
