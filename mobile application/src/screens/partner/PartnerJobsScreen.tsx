import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

import GlassCard from '../../components/ui/GlassCard';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import { useAppSelector } from '../../redux/hooks';
import {
  useAcceptDriverJobMutation,
  useDriverJobsQuery,
  useRejectDriverJobMutation,
} from '../../services/driver/useDriverQueries';
import { formatReadableAddress } from '../../utils/readableAddress';
import type { PartnerJobsStackParamList } from '../../types/partnerNavigation';
import { colors, radius, spacing, typography } from '../../theme';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';

const ACTIVE_STATUSES = new Set([
  'DRIVER_EN_ROUTE',
  'DRIVER_ARRIVED',
  'IN_PROGRESS',
]);

export default function PartnerJobsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PartnerJobsStackParamList>>();
  const user = useAppSelector(state => state.auth.user);
  const isDriver = user?.role === 'driver';
  const { data: jobs = [], isLoading, isRefetching, refetch, error } = useDriverJobsQuery(isDriver);
  const pendingApproval =
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    (error.response?.data as { message?: string } | undefined)?.message
      ?.toLowerCase()
      .includes('pending admin approval');
  const acceptMutation = useAcceptDriverJobMutation();
  const rejectMutation = useRejectDriverJobMutation();
  const [actingId, setActingId] = useState<string | null>(null);

  const onAccept = async (bookingId: string, bookingType: 'towing' | 'driver') => {
    setActingId(bookingId);
    try {
      await acceptMutation.mutateAsync({ bookingId, bookingType });
      navigation.navigate('PartnerActiveJob', { bookingId, bookingType });
    } catch (error) {
      Alert.alert('Accept failed', getApiErrorMessage(error, 'Could not accept job'));
    } finally {
      setActingId(null);
    }
  };

  const onReject = (bookingId: string, bookingType: 'towing' | 'driver') => {
    Alert.alert('Reject job?', 'This booking will go back for reassignment.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setActingId(bookingId);
            try {
              await rejectMutation.mutateAsync({ bookingId, bookingType });
            } catch (error) {
              Alert.alert('Reject failed', getApiErrorMessage(error, 'Could not reject job'));
            } finally {
              setActingId(null);
            }
          })();
        },
      },
    ]);
  };

  return (
    <AppScreenLayout
      header={
        <View style={styles.headerPad}>
          <Text style={styles.title}>Jobs</Text>
          <Text style={styles.subtitle}>
            {isDriver
              ? 'Accept allotted bookings — customer tracking updates live'
              : 'Driver accounts see and accept assigned jobs here'}
          </Text>
        </View>
      }
      scrollable={false}
      contentStyle={styles.content}>
      {!isDriver ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Driver jobs only</Text>
          <Text style={styles.emptySubtitle}>
            Log in as a driver (fleet or self-registered) to accept bookings.
          </Text>
        </View>
      ) : pendingApproval ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Waiting for approval</Text>
          <Text style={styles.emptySubtitle}>
            Your driver account is pending admin approval. Jobs will appear here once approved.
          </Text>
        </View>
      ) : isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : jobs.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.empty}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }>
          <View style={styles.iconWrap}>
            <Navigation size={40} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>No jobs yet</Text>
          <Text style={styles.emptySubtitle}>
            Stay online. When a customer books near you, the job appears here for Accept.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }>
          {jobs.map(job => {
            const canDecide = job.status === 'DRIVER_ASSIGNED';
            const isActive = ACTIVE_STATUSES.has(job.status);
            const busy = actingId === job.id;
            return (
              <GlassCard key={`${job.bookingType}-${job.id}`} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobNumber}>#{job.bookingNumber}</Text>
                  <View style={styles.typePill}>
                    <Text style={styles.typePillText}>
                      {job.bookingType === 'towing' ? 'Towing' : 'Driver'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.status}>{job.status.replace(/_/g, ' ')}</Text>
                <Text style={styles.address}>
                  Pickup: {formatReadableAddress(job.pickup?.address || job.pickup?.label)}
                </Text>
                {job.dropoff ? (
                  <Text style={styles.address}>
                    Drop: {formatReadableAddress(job.dropoff.address || job.dropoff.label)}
                  </Text>
                ) : null}
                {typeof job.estimatedFare === 'number' ? (
                  <Text style={styles.fare}>Est. ₹{Math.round(job.estimatedFare)}</Text>
                ) : null}

                {canDecide ? (
                  <View style={styles.actions}>
                    <Pressable
                      disabled={busy}
                      onPress={() => void onAccept(job.id, job.bookingType)}
                      style={[styles.acceptBtn, busy && styles.disabled]}>
                      <Text style={styles.acceptLabel}>{busy ? '…' : 'Accept'}</Text>
                    </Pressable>
                    <Pressable
                      disabled={busy}
                      onPress={() => onReject(job.id, job.bookingType)}
                      style={[styles.rejectBtn, busy && styles.disabled]}>
                      <Text style={styles.rejectLabel}>Reject</Text>
                    </Pressable>
                  </View>
                ) : isActive ? (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('PartnerActiveJob', {
                        bookingId: job.id,
                        bookingType: job.bookingType,
                      })
                    }
                    style={styles.manageBtn}>
                    <Text style={styles.manageLabel}>Manage active job →</Text>
                  </Pressable>
                ) : null}
              </GlassCard>
            );
          })}
        </ScrollView>
      )}
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
  title: {
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  content: { flexGrow: 1 },
  list: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  jobCard: { gap: spacing.xs },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobNumber: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  typePill: {
    backgroundColor: colors.goldLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  typePillText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.xs,
  },
  status: {
    color: colors.secondary,
    textTransform: 'capitalize',
    fontWeight: typography.weights.semibold,
  },
  address: { color: colors.grey, fontSize: typography.sizes.sm },
  fare: {
    marginTop: spacing.xs,
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  acceptBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  rejectBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectLabel: {
    color: colors.error,
    fontWeight: typography.weights.bold,
  },
  manageBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  manageLabel: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  disabled: { opacity: 0.5 },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxxl,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.dark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});
