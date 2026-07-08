import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Briefcase,
  Clock3,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from 'lucide-react-native';
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
import { useVendorDashboardQuery, useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import { getVendorConfig } from '../../data/vendorWizardConfig';
import type { PartnerTabParamList } from '../../types/partnerNavigation';
import type { VendorStatus } from '../../types/vendor';
import { formatReadableAddress } from '../../utils/readableAddress';
import { colors, radius, shadows, spacing, typography } from '../../theme';

const VENDOR_STATUS_META: Record<
  string,
  {
    label: string;
    hint: string;
    pillBg: string;
    pillText: string;
    border: string;
    cardBg: string;
    Icon: typeof ShieldCheck;
  }
> = {
  pending: {
    label: 'Pending review',
    hint: 'Submitted — waiting for admin approval on the portal',
    pillBg: 'rgba(244, 161, 21, 0.16)',
    pillText: colors.warning,
    border: 'rgba(244, 161, 21, 0.35)',
    cardBg: 'rgba(244, 161, 21, 0.06)',
    Icon: Clock3,
  },
  under_review: {
    label: 'Under review',
    hint: 'Admin is reviewing your application',
    pillBg: 'rgba(244, 161, 21, 0.16)',
    pillText: colors.warning,
    border: 'rgba(244, 161, 21, 0.35)',
    cardBg: 'rgba(244, 161, 21, 0.06)',
    Icon: Clock3,
  },
  approved: {
    label: 'Approved',
    hint: 'Your partner account is active — you can manage drivers & jobs',
    pillBg: 'rgba(34, 197, 94, 0.14)',
    pillText: colors.success,
    border: 'rgba(34, 197, 94, 0.35)',
    cardBg: 'rgba(34, 197, 94, 0.06)',
    Icon: ShieldCheck,
  },
  rejected: {
    label: 'Rejected',
    hint: 'Application was not approved. Contact RACE support if needed',
    pillBg: 'rgba(239, 68, 68, 0.12)',
    pillText: colors.error,
    border: 'rgba(239, 68, 68, 0.3)',
    cardBg: 'rgba(239, 68, 68, 0.05)',
    Icon: ShieldAlert,
  },
  changes_requested: {
    label: 'Changes requested',
    hint: 'Admin asked for updates — check verification details in Account',
    pillBg: 'rgba(244, 161, 21, 0.16)',
    pillText: colors.warning,
    border: 'rgba(244, 161, 21, 0.35)',
    cardBg: 'rgba(244, 161, 21, 0.06)',
    Icon: ShieldAlert,
  },
  draft: {
    label: 'Draft',
    hint: 'Finish registration to submit for review',
    pillBg: colors.lightGrey,
    pillText: colors.grey,
    border: colors.border,
    cardBg: colors.cardBg,
    Icon: Clock3,
  },
};

function getVendorStatusMeta(status?: VendorStatus | string) {
  if (!status) {
    return {
      label: 'Loading…',
      hint: 'Fetching latest verification status',
      pillBg: colors.lightGrey,
      pillText: colors.grey,
      border: colors.border,
      cardBg: colors.cardBg,
      Icon: Clock3,
    };
  }
  return (
    VENDOR_STATUS_META[status] ?? {
      label: status.replace(/_/g, ' '),
      hint: 'Current verification status from admin review',
      pillBg: colors.lightGrey,
      pillText: colors.grey,
      border: colors.border,
      cardBg: colors.cardBg,
      Icon: Clock3,
    }
  );
}

export default function PartnerHomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<PartnerTabParamList>>();
  const user = useAppSelector(state => state.auth.user);
  const isDriver = user?.role === 'driver';
  const isVendor = user?.role === 'vendor';

  const {
    data: vendor,
    isLoading: vendorLoading,
    isRefetching: vendorRefetching,
    refetch: refetchVendor,
  } = useVendorStatusQuery(isVendor);
  const { data: vendorDashboard } = useVendorDashboardQuery(isVendor);
  const { data: jobs = [], refetch: refetchDriverJobs } = useDriverJobsQuery(isDriver);
  const { data: activeJob } = useDriverActiveJobQuery(isDriver);
  const availabilityMutation = useDriverAvailabilityMutation();

  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const config = vendor ? getVendorConfig(vendor.vendorType) : undefined;
  const vendorMeta = getVendorStatusMeta(vendorLoading ? undefined : vendor?.status);
  const VendorStatusIcon = vendorMeta.Icon;

  const todayJobs = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return jobs.filter(job => new Date(job.createdAt) >= start);
  }, [jobs]);

  const earningsToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (isVendor) {
      return vendorDashboard?.earningsToday ?? 0;
    }
    return jobs
      .filter(
        job =>
          new Date(job.createdAt) >= start &&
          job.status === 'COMPLETED' &&
          typeof job.estimatedFare === 'number',
      )
      .reduce((sum, job) => sum + (job.estimatedFare ?? 0), 0);
  }, [isVendor, jobs, vendorDashboard?.earningsToday]);

  const jobsTodayCount = isVendor ? (vendorDashboard?.jobsToday ?? 0) : todayJobs.length;

  const formatInr = (amount: number) =>
    `₹${Math.round(amount).toLocaleString('en-IN')}`;

  const statusLabel = isDriver
    ? isOnline
      ? 'Online'
      : 'Offline'
    : vendorMeta.label;

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isVendor) await refetchVendor();
      if (isDriver) await refetchDriverJobs();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AppScreenLayout
      refreshing={refreshing || vendorRefetching}
      onRefresh={isVendor || isDriver ? () => void onRefresh() : undefined}
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
        <View
          style={[
            styles.statusCard,
            { backgroundColor: vendorMeta.cardBg, borderColor: vendorMeta.border },
          ]}>
          <View style={styles.statusTopRow}>
            <View style={[styles.statusIconWrap, { backgroundColor: vendorMeta.pillBg }]}>
              <VendorStatusIcon size={20} color={vendorMeta.pillText} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.onlineLabel}>Vendor status</Text>
              <Text style={styles.statusHint}>{vendorMeta.hint}</Text>
            </View>
            <Pressable
              onPress={() => void refetchVendor()}
              hitSlop={10}
              style={styles.refreshBtn}
              accessibilityRole="button"
              accessibilityLabel="Refresh status">
              <RefreshCw
                size={16}
                color={colors.grey}
                strokeWidth={2.4}
                style={vendorRefetching ? styles.spinHint : undefined}
              />
            </Pressable>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: vendorMeta.pillBg }]}>
            <View style={[styles.statusDot, { backgroundColor: vendorMeta.pillText }]} />
            <Text style={[styles.statusBadgeText, { color: vendorMeta.pillText }]}>
              {vendorMeta.label}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <Briefcase size={22} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.statValue}>{String(jobsTodayCount)}</Text>
          <Text style={styles.statLabel}>Jobs today</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Wallet size={22} color={colors.secondary} strokeWidth={2.2} />
          <Text style={styles.statValue}>{formatInr(earningsToday)}</Text>
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
    fontSize: typography.sizes.md,
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
  statusCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHint: {
    color: colors.grey,
    marginTop: 4,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.normal,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.lightGrey,
  },
  spinHint: {
    opacity: 0.45,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
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
