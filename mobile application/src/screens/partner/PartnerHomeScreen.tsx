import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import { getVendorConfig } from '../../data/vendorWizardConfig';
import { useAppSelector } from '../../redux/hooks';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import { colors, radius, spacing, typography } from '../../theme';

export default function PartnerHomeScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: vendor, isLoading } = useVendorStatusQuery();

  const config = vendor ? getVendorConfig(vendor.vendorType) : undefined;

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ScreenContent>
            <View style={styles.header}>
              <Text style={styles.badge}>RACE PARTNER</Text>
              <Text style={styles.greeting}>Hello, {user?.fullName ?? 'Partner'}</Text>
              <Text style={styles.subtitle}>
                {config?.title ?? 'Partner'} · {vendor?.status?.replace(/_/g, ' ') ?? 'loading...'}
              </Text>
            </View>

            <View style={styles.onlineCard}>
              <View>
                <Text style={styles.onlineLabel}>Availability</Text>
                <Text style={styles.onlineValue}>Go online to receive jobs</Text>
              </View>
              <View style={styles.onlinePill}>
                <View style={styles.offlineDot} />
                <Text style={styles.onlinePillText}>Offline</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <GlassCard style={styles.statCard}>
                <Ionicons name="briefcase-outline" size={22} color={colors.primary} />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Jobs today</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="wallet-outline" size={22} color={colors.secondary} />
                <Text style={styles.statValue}>₹0</Text>
                <Text style={styles.statLabel}>Earnings</Text>
              </GlassCard>
            </View>

            <GlassCard>
              <Text style={styles.cardTitle}>Quick actions</Text>
              <PrimaryButton label="View job requests" variant="outline" onPress={() => undefined} />
              <View style={styles.spacer} />
              <PrimaryButton label="Update documents" variant="outline" onPress={() => undefined} />
            </GlassCard>

            {!isLoading && vendor?.status === 'approved' ? (
              <View style={styles.approvedBanner}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                <Text style={styles.approvedText}>Your partner account is active</Text>
              </View>
            ) : null}
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  badge: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
    fontSize: typography.sizes.xs,
  },
  greeting: {
    color: colors.textLight,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  subtitle: { color: colors.subtext, marginTop: spacing.xs, textTransform: 'capitalize' },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  onlineLabel: { color: colors.textLight, fontWeight: typography.weights.bold },
  onlineValue: { color: colors.subtext, marginTop: 4, fontSize: typography.sizes.sm },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceDarker,
  },
  offlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted },
  onlinePillText: { color: colors.subtext, fontWeight: typography.weights.semibold },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statValue: { color: colors.textLight, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  statLabel: { color: colors.subtext, fontSize: typography.sizes.sm },
  cardTitle: { color: colors.textLight, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  spacer: { height: spacing.sm },
  approvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  approvedText: { color: colors.success, fontWeight: typography.weights.semibold },
});
