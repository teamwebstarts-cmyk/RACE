import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Briefcase, ShieldCheck, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import { useAppSelector } from '../../redux/hooks';
import {
  useDriverActiveJobQuery,
  useDriverAvailabilityMutation,
  useDriverJobsQuery,
} from '../../services/driver/useDriverQueries';
import { useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import { getVendorConfig } from '../../data/vendorWizardConfig';
import type { PartnerTabParamList } from '../../types/partnerNavigation';
import { formatReadableAddress } from '../../utils/readableAddress';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export default function PartnerHomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<PartnerTabParamList>>();
  const user = useAppSelector(state => state.auth.user);
  const isDriver = user?.role === 'driver';
  const isVendor = user?.role === 'vendor';

  const { data: vendor, isLoading: vendorLoading } = useVendorStatusQuery(isVendor);
  const { data: jobs = [] } = useDriverJobsQuery(isDriver);
  const { data: activeJob } = useDriverActiveJobQuery(isDriver);
  const availabilityMutation = useDriverAvailabilityMutation();

  const [isOnline, setIsOnline] = useState(true);
  const config = vendor ? getVendorConfig(vendor.vendorType) : undefined;

  const todayJobs = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return jobs.filter(job => new Date(job.createdAt) >= start);
  }, [jobs]);

  const statusLabel = isDriver
    ? isOnline
      ? 'Online'
      : 'Offline'
    : vendor?.status?.replace(/_/g, ' ') ?? (vendorLoading ? 'loading...' : 'partner');

  const toggleAvailability = async () => {
    if (!isDriver) {
      Alert.alert('Availability', 'Go online is available for driver accounts.');
      return;
    }
    const next = !isOnline;
    try {
      const result = await availabilityMutation.mutateAsync(next);
      setIsOnline(result.isAvailable);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message)
          : 'Could not update availability';
      Alert.alert('Availability', message || 'Could not update availability');
    }
  };

  return (
    <AppScreenLayout
      header={
        <View style={styles.headerPad}>
          <Text style={styles.badge}>RACE PARTNER</Text>
          <Text style={styles.greeting}>Hello, {user?.fullName ?? 'Partner'}</Text>
          <Text style={styles.subtitle}>
            {isDriver ? 'Driver' : config?.title ?? 'Partner'} · {statusLabel}
          </Text>
        </View>
      }>
      {isDriver ? (
        <Pressable
          onPress={() => void toggleAvailability()}
          style={[styles.onlineCard, isOnline && styles.onlineCardActive]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.onlineLabel}>Availability</Text>
            <Text style={styles.onlineValue}>
              {availabilityMutation.isPending
                ? 'Updating…'
                : isOnline
                  ? 'You are online — ready for jobs'
                  : 'Go online to receive jobs'}
            </Text>
          </View>
          <View style={[styles.onlinePill, isOnline && styles.onlinePillActive]}>
            <View style={[styles.offlineDot, isOnline && styles.onlineDot]} />
            <Text style={[styles.onlinePillText, isOnline && styles.onlinePillTextActive]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.onlineCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.onlineLabel}>Vendor status</Text>
            <Text style={styles.onlineValue}>{statusLabel}</Text>
          </View>
        </View>
      )}

      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <Briefcase size={22} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.statValue}>{isDriver ? String(todayJobs.length) : '0'}</Text>
          <Text style={styles.statLabel}>Jobs today</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Wallet size={22} color={colors.secondary} strokeWidth={2.2} />
          <Text style={styles.statValue}>₹0</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </GlassCard>
      </View>

      {activeJob ? (
        <GlassCard style={styles.activeJobCard}>
          <Text style={styles.cardTitle}>Active job</Text>
          <Text style={styles.jobNumber}>#{activeJob.bookingNumber}</Text>
          <Text style={styles.jobMeta}>
            {activeJob.bookingType === 'towing' ? 'Towing' : 'Driver hire'} ·{' '}
            {activeJob.status.replace(/_/g, ' ')}
          </Text>
          <Text style={styles.jobAddress}>
            {formatReadableAddress(activeJob.pickup?.address || activeJob.pickup?.label)}
          </Text>
          <PrimaryButton
            label="Open jobs"
            variant="outline"
            onPress={() => navigation.navigate('PartnerJobs')}
          />
        </GlassCard>
      ) : (
        <GlassCard>
          <Text style={styles.cardTitle}>Quick actions</Text>
          <PrimaryButton
            label="View job requests"
            variant="outline"
            onPress={() => navigation.navigate('PartnerJobs')}
          />
          {isVendor ? (
            <>
              <View style={styles.spacer} />
              <PrimaryButton
                label="Manage drivers"
                variant="outline"
                onPress={() =>
                  navigation.navigate('PartnerAccount', { screen: 'VendorDrivers' } as never)
                }
              />
            </>
          ) : null}
        </GlassCard>
      )}

      {!vendorLoading && vendor?.status === 'approved' ? (
        <View style={styles.approvedBanner}>
          <ShieldCheck size={20} color={colors.success} strokeWidth={2.2} />
          <Text style={styles.approvedText}>Your partner account is active</Text>
        </View>
      ) : null}

      {isDriver ? (
        <View style={styles.approvedBanner}>
          <ShieldCheck size={20} color={colors.success} strokeWidth={2.2} />
          <Text style={styles.approvedText}>Driver account ready — stay online to get jobs</Text>
        </View>
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  badge: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
    fontSize: typography.sizes.xs,
  },
  greeting: {
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.grey,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
    fontSize: typography.sizes.sm,
  },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  onlineCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.goldLight,
  },
  onlineLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  onlineValue: {
    color: colors.grey,
    marginTop: 4,
    fontSize: typography.sizes.sm,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.lightGrey,
  },
  onlinePillActive: {
    backgroundColor: colors.dark,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  onlineDot: {
    backgroundColor: colors.success,
  },
  onlinePillText: {
    color: colors.grey,
    fontWeight: typography.weights.semibold,
  },
  onlinePillTextActive: {
    color: colors.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.dark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  cardTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  activeJobCard: {
    marginBottom: spacing.md,
  },
  jobNumber: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  jobMeta: {
    color: colors.grey,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  jobAddress: {
    color: colors.dark,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    fontWeight: typography.weights.semibold,
  },
  approvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  approvedText: {
    color: colors.success,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  spacer: { height: spacing.sm },
});
