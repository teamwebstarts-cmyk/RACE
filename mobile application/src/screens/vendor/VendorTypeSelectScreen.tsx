import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import GlassCard from '../../components/ui/GlassCard';
import type { ProfileStackParamList } from '../../types/navigation';
import type { VendorType } from '../../types/auth';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'VendorTypeSelect'>;

const VENDOR_TYPES: Array<{ id: VendorType; title: string; subtitle: string }> = [
  { id: 'towing_company', title: 'Towing Company', subtitle: 'Fleet operators and towing businesses' },
  { id: 'tow_truck_driver', title: 'Tow Truck Driver', subtitle: 'Independent tow truck operators' },
  { id: 'full_time_driver', title: 'Full Time Driver', subtitle: 'On-demand professional drivers' },
  { id: 'part_time_driver', title: 'Part Time Driver', subtitle: 'Flexible driving partners' },
  { id: 'mechanic', title: 'Mechanic Partner', subtitle: 'Roadside mechanic services (coming soon)' },
];

export default function VendorTypeSelectScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Partner With RACE</Text>
        <Text style={styles.subtitle}>Choose your onboarding path</Text>

        {VENDOR_TYPES.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate('VendorOnboarding', { vendorType: item.id })}
            disabled={item.id === 'mechanic'}>
            <GlassCard style={[styles.card, item.id === 'mechanic' && styles.disabled]}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceDarker },
  content: { padding: spacing.lg },
  title: { color: colors.textLight, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold },
  subtitle: { color: colors.subtext, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  cardTitle: { color: colors.textLight, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  cardSubtitle: { color: colors.subtext, marginTop: spacing.xs },
  disabled: { opacity: 0.5 },
});
