import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CloudUpload,
  FileSearch,
  Info,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import AppScreenLayout from '../../components/ui/AppScreenLayout';
import { useAppSelector } from '../../redux/hooks';
import { useDriverLocationReporting } from '../../hooks/useDriverLocationReporting';
import {
  useDriverActiveJobQuery,
  useDriverAvailabilityMutation,
  useDriverJobsQuery,
} from '../../services/driver/useDriverQueries';
import { getProfile } from '../../services/profileService';
import {
  useVendorBookingOffersQuery,
  useVendorFleetDriversQuery,
} from '../../services/vendor/useVendorBookingsQueries';
import { useVendorDashboardQuery, useVendorStatusQuery } from '../../services/vendor/useVendorMutations';
import type { PartnerTabParamList } from '../../types/partnerNavigation';
import type { VerificationStage, VendorProfileResponse } from '../../types/vendor';
import { formatReadableAddress } from '../../utils/readableAddress';
import { colors, layout, radius, shadows, spacing, typography } from '../../theme';

const PAGE_BG = '#F7F7F5';
const SUCCESS_GREEN = '#22C55E';
const INFO_BLUE = '#2563EB';
const PURPLE = '#7C3AED';
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const STAGE_LABELS: Record<VerificationStage, string> = {
  submitted: 'Submitted',
  document_review: 'Document review',
  background_check: 'Background check',
  selfie_match: 'Selfie match',
  approved: 'Approved',
  rejected: 'Rejected',
};

function firstName(fullName?: string | null) {
  const name = (fullName ?? '').trim();
  if (!name) return 'Partner';
  return name.split(/\s+/)[0] ?? 'Partner';
}

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatInr(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatCompactInr(amount: number) {
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k >= 10 ? Math.round(k) : k.toFixed(1)}K`;
  }
  return formatInr(amount);
}

function formatActivityTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(+date)) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const wasYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (sameDay) return `Today, ${time}`;
  if (wasYesterday) return `Yesterday, ${time}`;
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function verificationCopy(vendor?: VendorProfileResponse | null) {
  if (!vendor) {
    return {
      title: 'Verification',
      badge: 'Pending',
      hint: 'Complete registration to start verification.',
      tone: 'pending' as const,
    };
  }
  if (vendor.status === 'approved' || vendor.verificationStage === 'approved') {
    return {
      title: 'Verification: Approved',
      badge: 'Completed',
      hint: 'Your partner account is active.',
      tone: 'completed' as const,
    };
  }
  if (vendor.status === 'rejected' || vendor.verificationStage === 'rejected') {
    return {
      title: 'Verification: Rejected',
      badge: 'Rejected',
      hint: vendor.reviewNotes || 'Contact support for next steps.',
      tone: 'rejected' as const,
    };
  }
  const stage = STAGE_LABELS[vendor.verificationStage] ?? 'In review';
  return {
    title: `Verification: ${stage}`,
    badge: 'In progress',
    hint: "We're reviewing your documents.",
    tone: 'progress' as const,
  };
}

function weekdayIndex(date = new Date()) {
  // Convert JS Sunday=0 → Monday=0
  return (date.getDay() + 6) % 7;
}

function buildWeekSeries(earningsToday: number) {
  const todayIdx = weekdayIndex();
  return DAY_LABELS.map((label, index) => ({
    label,
    value: index === todayIdx ? Math.max(0, earningsToday) : 0,
  }));
}

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  at?: string;
  status: 'Completed' | 'In progress' | 'New';
  tone: 'green' | 'yellow' | 'blue' | 'purple';
  Icon: typeof CloudUpload;
};

function buildActivity(args: {
  vendor?: VendorProfileResponse | null;
  offers: Array<{ id: string; bookingNumber?: string; createdAt: string; pickup?: { address?: string; label?: string } }>;
  drivers: Array<{ id: string; name: string }>;
}): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const entry of args.vendor?.statusHistory ?? []) {
    const stage = entry.status as VerificationStage;
    const isReview = stage === 'document_review';
    items.push({
      id: `hist-${entry.status}-${entry.changedAt}`,
      title: isReview
        ? 'Document review started'
        : stage === 'submitted'
          ? 'Document submitted'
          : STAGE_LABELS[stage] ?? entry.status.replace(/_/g, ' '),
      description:
        entry.note ||
        (isReview
          ? 'Our team has started reviewing your documents'
          : stage === 'submitted'
            ? 'Registration submitted successfully'
            : 'Status updated'),
      at: entry.changedAt,
      status: stage === 'approved' || stage === 'submitted' ? 'Completed' : 'In progress',
      tone: stage === 'submitted' || stage === 'approved' ? 'green' : 'yellow',
      Icon: isReview ? FileSearch : CloudUpload,
    });
  }

  for (const doc of args.vendor?.documents ?? []) {
    items.push({
      id: `doc-${doc.id}`,
      title: 'Document submitted',
      description: `${doc.documentType.replace(/_/g, ' ')} uploaded successfully`,
      at: doc.uploadedAt,
      status: 'Completed',
      tone: 'green',
      Icon: CloudUpload,
    });
  }

  for (const offer of args.offers.slice(0, 3)) {
    items.push({
      id: `offer-${offer.id}`,
      title: 'New job request received',
      description: `Request #${offer.bookingNumber ?? offer.id.slice(-6)} received from ${
        formatReadableAddress(offer.pickup?.address || offer.pickup?.label) || 'nearby'
      }`,
      at: offer.createdAt,
      status: 'New',
      tone: 'blue',
      Icon: Briefcase,
    });
  }

  for (const driver of args.drivers.slice(0, 2)) {
    items.push({
      id: `driver-${driver.id}`,
      title: 'Driver added',
      description: `${driver.name} has been added to your fleet`,
      status: 'Completed',
      tone: 'purple',
      Icon: Users,
    });
  }

  return items
    .sort((a, b) => +new Date(b.at ?? 0) - +new Date(a.at ?? 0))
    .slice(0, 4);
}

function EarningsChart({
  points,
  width,
  height = 150,
}: {
  points: Array<{ label: string; value: number }>;
  width: number;
  height?: number;
}) {
  const padX = 18;
  const padTop = 28;
  const padBottom = 28;
  const chartW = Math.max(1, width - padX * 2);
  const chartH = Math.max(1, height - padTop - padBottom);
  const maxValue = Math.max(...points.map(p => p.value), 1);
  const coords = points.map((point, index) => {
    const x = padX + (index / Math.max(points.length - 1, 1)) * chartW;
    const y = padTop + chartH - (point.value / maxValue) * chartH;
    return { ...point, x, y };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L ${coords[coords.length - 1]?.x ?? padX} ${(padTop + chartH).toFixed(1)} L ${
    coords[0]?.x ?? padX
  } ${(padTop + chartH).toFixed(1)} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.35" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#earnFill)" />
      <Path d={line} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {coords.map(point => (
        <React.Fragment key={point.label}>
          <Circle cx={point.x} cy={point.y} r={5} fill={colors.primary} />
          <Circle cx={point.x} cy={point.y} r={2.5} fill="#FFFFFF" />
          {point.value > 0 ? (
            <SvgText
              x={point.x}
              y={point.y - 10}
              fill={colors.dark}
              fontSize="10"
              fontWeight="700"
              textAnchor="middle">
              {formatCompactInr(point.value)}
            </SvgText>
          ) : null}
          <SvgText
            x={point.x}
            y={height - 8}
            fill={colors.grey}
            fontSize="10"
            fontWeight="600"
            textAnchor="middle">
            {point.label}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}

function QuickAction({
  title,
  subtitle,
  Icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  Icon: typeof ClipboardList;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <View style={styles.actionIcon}>
        <Icon size={18} color={colors.primaryDark} strokeWidth={2.2} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={colors.grey} strokeWidth={2.2} />
    </Pressable>
  );
}

function statusPill(status: ActivityItem['status']) {
  if (status === 'Completed') {
    return { wrap: styles.pillCompleted, text: styles.pillCompletedText };
  }
  if (status === 'In progress') {
    return { wrap: styles.pillProgress, text: styles.pillProgressText };
  }
  return { wrap: styles.pillNew, text: styles.pillNewText };
}

function activityTone(tone: ActivityItem['tone']) {
  if (tone === 'green') return { bg: '#DCFCE7', color: SUCCESS_GREEN };
  if (tone === 'yellow') return { bg: colors.goldLight, color: colors.primaryDark };
  if (tone === 'blue') return { bg: '#DBEAFE', color: INFO_BLUE };
  return { bg: '#EDE9FE', color: PURPLE };
}

export default function PartnerHomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<PartnerTabParamList>>();
  const { width } = useWindowDimensions();
  const user = useAppSelector(state => state.auth.user);
  const isDriver = user?.role === 'driver';
  const isVendor = user?.role === 'vendor';

  const {
    data: vendor,
    isLoading: vendorLoading,
    isRefetching: vendorRefetching,
    refetch: refetchVendor,
  } = useVendorStatusQuery(isVendor);
  const { data: vendorDashboard, refetch: refetchDashboard } = useVendorDashboardQuery(isVendor);
  const { data: offers = [], refetch: refetchOffers } = useVendorBookingOffersQuery(isVendor);
  const { data: drivers = [], refetch: refetchDrivers } = useVendorFleetDriversQuery(isVendor);
  const { data: jobs = [], refetch: refetchDriverJobs } = useDriverJobsQuery(isDriver);
  const { data: activeJob } = useDriverActiveJobQuery(isDriver);
  const availabilityMutation = useDriverAvailabilityMutation();

  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isDriver) return;
    void getProfile()
      .then(profile => {
        if (typeof profile.isAvailable === 'boolean') {
          setIsOnline(profile.isAvailable);
        }
      })
      .catch(() => {
        // Keep default online state if profile fetch fails.
      });
  }, [isDriver]);

  useDriverLocationReporting(isDriver && isOnline);

  const earningsToday = useMemo(() => {
    if (isVendor) return vendorDashboard?.earningsToday ?? 0;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return jobs
      .filter(
        job =>
          new Date(job.createdAt) >= start &&
          job.status === 'COMPLETED' &&
          typeof job.estimatedFare === 'number',
      )
      .reduce((sum, job) => sum + (job.estimatedFare ?? 0), 0);
  }, [isVendor, jobs, vendorDashboard?.earningsToday]);

  const weekPoints = useMemo(() => buildWeekSeries(earningsToday), [earningsToday]);
  const chartWidth = Math.max(260, width - layout.screenPadding * 2 - spacing.lg * 2);

  const jobsTodayCount = isVendor
    ? (vendorDashboard?.jobsToday ?? offers.length)
    : jobs.filter(job => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return new Date(job.createdAt) >= start;
      }).length;

  const openJobs = isVendor
    ? offers.length
    : jobs.filter(j => j.status === 'SEARCHING' || j.status === 'DRIVER_ASSIGNED').length;
  const inProgressJobs = isVendor
    ? drivers.filter(d => d.isBusy).length
    : jobs.filter(j =>
        ['DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'IN_PROGRESS'].includes(j.status),
      ).length;

  const activeDrivers = drivers.length;
  const onJobDrivers = drivers.filter(d => d.isBusy).length;
  const availableDrivers = drivers.filter(d => d.isAvailable && !d.isBusy).length;

  const verification = verificationCopy(vendorLoading ? null : vendor);
  const activity = useMemo(
    () => buildActivity({ vendor, offers, drivers }),
    [vendor, offers, drivers],
  );

  const name = firstName(user?.fullName);
  const initial = name.charAt(0).toUpperCase() || 'P';

  const toggleAvailability = async () => {
    if (!isDriver) return;
    const next = !isOnline;
    try {
      const result = await availabilityMutation.mutateAsync(next);
      setIsOnline(result.isAvailable);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? String(
              (error as { response?: { data?: { message?: string } } }).response?.data?.message,
            )
          : 'Could not update availability';
      Alert.alert('Availability', message || 'Could not update availability');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isVendor) {
        await Promise.all([
          refetchVendor(),
          refetchDashboard(),
          refetchOffers(),
          refetchDrivers(),
        ]);
      }
      if (isDriver) await refetchDriverJobs();
    } finally {
      setRefreshing(false);
    }
  };

  const goAccountScreen = (screen: 'VendorDrivers' | 'VendorVehicles' | 'VendorVerificationStatus') => {
    navigation.navigate('PartnerAccount', { screen } as never);
  };

  return (
    <AppScreenLayout
      backgroundColor={PAGE_BG}
      refreshing={refreshing || vendorRefetching}
      onRefresh={isVendor || isDriver ? () => void onRefresh() : undefined}
      header={
        <View style={styles.headerPad}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brandRace}>RACE</Text>
              <Text style={styles.brandPartner}>PARTNER</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.partnerPill}>
                <Text style={styles.partnerPillText}>Partner</Text>
              </View>
              <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <Text style={styles.avatarName} numberOfLines={1}>
                  {user?.fullName ?? 'Partner'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.greeting}>
            {greetingForNow()}, {name} 👋
          </Text>
          <Text style={styles.subtitle}>Here's what's happening with your business today.</Text>
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
      ) : null}

      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <View style={styles.earningsTitleRow}>
            <Text style={styles.earningsTitle}>Total earnings (this week)</Text>
            <Info size={14} color={colors.grey} strokeWidth={2.2} />
          </View>
          <View style={styles.periodPill}>
            <Text style={styles.periodText}>This week</Text>
            <ChevronDown size={14} color={colors.grey} strokeWidth={2.4} />
          </View>
        </View>
        <Text style={styles.earningsValue}>{formatInr(earningsToday)}</Text>
        <Text style={styles.earningsGrowth}>
          {earningsToday > 0
            ? `Today's completed earnings · Total ${formatInr(vendorDashboard?.earningsTotal ?? earningsToday)}`
            : 'No completed earnings yet this week'}
        </Text>
        <View style={styles.chartWrap}>
          <EarningsChart points={weekPoints} width={chartWidth} />
        </View>
      </View>

      <View style={styles.actionsGrid}>
        <QuickAction
          title="View requests"
          subtitle="See new towing & roadside requests"
          Icon={ClipboardList}
          onPress={() => navigation.navigate('PartnerJobs')}
        />
        {isVendor ? (
          <>
            <QuickAction
              title="Manage drivers"
              subtitle="Add, edit & manage your fleet drivers"
              Icon={Users}
              onPress={() => goAccountScreen('VendorDrivers')}
            />
            <QuickAction
              title="Manage vehicles"
              subtitle="Add, edit & manage your fleet vehicles"
              Icon={Truck}
              onPress={() => goAccountScreen('VendorVehicles')}
            />
            <QuickAction
              title="Verification"
              subtitle="Track your verification status & documents"
              Icon={ShieldCheck}
              onPress={() => goAccountScreen('VendorVerificationStatus')}
            />
          </>
        ) : (
          <QuickAction
            title="Active job"
            subtitle={
              activeJob
                ? `#${activeJob.bookingNumber} · ${formatReadableAddress(activeJob.pickup?.address || activeJob.pickup?.label)}`
                : 'No active job right now'
            }
            Icon={Briefcase}
            onPress={() => {
              if (!activeJob) {
                navigation.navigate('PartnerJobs');
                return;
              }
              navigation.navigate('PartnerJobs', {
                screen: 'PartnerActiveJob',
                params: {
                  bookingId: activeJob.id,
                  bookingType: activeJob.bookingType,
                },
              } as never);
            }}
          />
        )}
      </View>

      <View style={styles.statusStack}>
        <Pressable
          onPress={() => (isVendor ? goAccountScreen('VendorVerificationStatus') : undefined)}
          style={({ pressed }) => [styles.statusCard, pressed && isVendor && styles.pressed]}>
          <View style={[styles.statusIcon, { backgroundColor: colors.goldLight }]}>
            <ShieldCheck size={18} color={colors.primaryDark} strokeWidth={2.2} />
          </View>
          <View style={styles.statusCopy}>
            <View style={styles.statusTitleRow}>
              <Text style={styles.statusTitle} numberOfLines={1}>
                {verification.title}
              </Text>
              <View
                style={[
                  styles.badge,
                  verification.tone === 'completed' && styles.badgeCompleted,
                  verification.tone === 'rejected' && styles.badgeRejected,
                  verification.tone === 'progress' && styles.badgeProgress,
                  verification.tone === 'pending' && styles.badgePending,
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    verification.tone === 'completed' && styles.badgeCompletedText,
                    verification.tone === 'rejected' && styles.badgeRejectedText,
                    verification.tone === 'progress' && styles.badgeProgressText,
                    verification.tone === 'pending' && styles.badgePendingText,
                  ]}>
                  {verification.badge}
                </Text>
              </View>
            </View>
            <Text style={styles.statusHint}>{verification.hint}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('PartnerJobs')}
          style={({ pressed }) => [styles.statusCard, pressed && styles.pressed]}>
          <View style={[styles.statusIcon, { backgroundColor: '#DBEAFE' }]}>
            <Briefcase size={18} color={INFO_BLUE} strokeWidth={2.2} />
          </View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusEyebrow}>Jobs today</Text>
            <Text style={styles.statusBig}>{String(jobsTodayCount)}</Text>
            <View style={styles.dotRow}>
              <View style={[styles.dot, { backgroundColor: INFO_BLUE }]} />
              <Text style={styles.dotText}>{openJobs} Open</Text>
              <Text style={styles.dotSep}>•</Text>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={styles.dotText}>{inProgressJobs} In progress</Text>
            </View>
          </View>
        </Pressable>

        {isVendor ? (
          <Pressable
            onPress={() => goAccountScreen('VendorDrivers')}
            style={({ pressed }) => [styles.statusCard, pressed && styles.pressed]}>
            <View style={[styles.statusIcon, { backgroundColor: '#DCFCE7' }]}>
              <Users size={18} color={SUCCESS_GREEN} strokeWidth={2.2} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusEyebrow}>Active drivers</Text>
              <Text style={styles.statusBig}>{String(activeDrivers)}</Text>
              <View style={styles.dotRow}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <Text style={styles.dotText}>{onJobDrivers} On job</Text>
                <Text style={styles.dotSep}>•</Text>
                <View style={[styles.dot, { backgroundColor: SUCCESS_GREEN }]} />
                <Text style={styles.dotText}>{availableDrivers} Available</Text>
              </View>
            </View>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>Recent activity</Text>
          <Pressable onPress={() => navigation.navigate('PartnerJobs')} hitSlop={8}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        {activity.length === 0 ? (
          <Text style={styles.emptyActivity}>No recent activity yet.</Text>
        ) : (
          activity.map(item => {
            const tone = activityTone(item.tone);
            const pill = statusPill(item.status);
            const Icon = item.Icon;
            return (
              <View key={item.id} style={styles.activityRow}>
                <View style={[styles.activityIcon, { backgroundColor: tone.bg }]}>
                  <Icon size={16} color={tone.color} strokeWidth={2.2} />
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityItemTitle}>{item.title}</Text>
                  <Text style={styles.activityDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.activityTime}>{formatActivityTime(item.at) || '—'}</Text>
                </View>
                <View style={pill.wrap}>
                  <Text style={pill.text}>{item.status}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: PAGE_BG,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandRace: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    fontSize: typography.sizes.md,
    letterSpacing: 0.4,
  },
  brandPartner: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  partnerPill: {
    backgroundColor: colors.goldLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  partnerPillText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xs,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 140,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  avatarName: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    flexShrink: 1,
  },
  greeting: {
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    marginTop: spacing.lg,
  },
  subtitle: {
    color: colors.grey,
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
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
  earningsCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  earningsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  earningsTitle: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.lightGrey,
  },
  periodText: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  earningsValue: {
    marginTop: spacing.sm,
    color: colors.dark,
    fontSize: 32,
    fontWeight: typography.weights.extrabold,
  },
  earningsGrowth: {
    marginTop: 4,
    color: SUCCESS_GREEN,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  chartWrap: {
    marginTop: spacing.md,
  },
  actionsGrid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1 },
  actionTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
  },
  actionSubtitle: {
    marginTop: 2,
    color: colors.grey,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  statusStack: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCopy: { flex: 1 },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusTitle: {
    flex: 1,
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
  },
  statusEyebrow: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  statusBig: {
    marginTop: 2,
    color: colors.dark,
    fontSize: 28,
    fontWeight: typography.weights.extrabold,
  },
  statusHint: {
    marginTop: 4,
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeProgress: { backgroundColor: colors.goldLight },
  badgeCompleted: { backgroundColor: '#DCFCE7' },
  badgeRejected: { backgroundColor: '#FEE2E2' },
  badgePending: { backgroundColor: colors.lightGrey },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  badgeProgressText: { color: colors.primaryDark },
  badgeCompletedText: { color: SUCCESS_GREEN },
  badgeRejectedText: { color: colors.error },
  badgePendingText: { color: colors.grey },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotText: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  dotSep: {
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  activityCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  activityTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  viewAll: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  emptyActivity: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: { flex: 1 },
  activityItemTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  activityDesc: {
    marginTop: 2,
    color: colors.grey,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  activityTime: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  pillCompleted: {
    backgroundColor: '#DCFCE7',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pillCompletedText: {
    color: SUCCESS_GREEN,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  pillProgress: {
    backgroundColor: colors.goldLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pillProgressText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  pillNew: {
    backgroundColor: '#DBEAFE',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pillNewText: {
    color: INFO_BLUE,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  pressed: { opacity: 0.92 },
});
