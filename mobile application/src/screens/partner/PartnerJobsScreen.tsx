import React, { useEffect, useMemo, useState } from 'react';
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
  useDriverJobOffersQuery,
  useDriverJobsQuery,
  useRejectDriverJobMutation,
} from '../../services/driver/useDriverQueries';
import type { DriverJobBooking } from '../../services/driver/driverApi';
import type { FleetDriver } from '../../services/vendor/vendorDriversApi';
import {
  useAssignVendorBookingMutation,
  useVendorBookingOffersQuery,
  useVendorFleetDriversQuery,
  useVendorFleetVehiclesQuery,
} from '../../services/vendor/useVendorBookingsQueries';
import { formatReadableAddress } from '../../utils/readableAddress';
import type { PartnerJobsStackParamList } from '../../types/partnerNavigation';
import { colors, radius, spacing, typography } from '../../theme';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';

const ACTIVE_STATUSES = new Set(['DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'IN_PROGRESS']);

function eligibleDrivers(drivers: FleetDriver[], bookingType: 'towing' | 'driver') {
  return drivers.filter(d => {
    if (d.isBusy) return false;
    const type = d.driverType.toLowerCase();
    if (bookingType === 'towing') {
      return type.includes('tow');
    }
    return type.includes('full') || type.includes('part');
  });
}

function isPendingApprovalError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    String((error.response?.data as { message?: string } | undefined)?.message ?? '')
      .toLowerCase()
      .includes('pending admin approval')
  );
}

export default function PartnerJobsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PartnerJobsStackParamList>>();
  const user = useAppSelector(state => state.auth.user);
  const isDriver = user?.role === 'driver';
  const isVendor = user?.role === 'vendor';

  const driverJobsQuery = useDriverJobsQuery(isDriver);
  const driverOffersQuery = useDriverJobOffersQuery(isDriver);
  const vendorOffersQuery = useVendorBookingOffersQuery(isVendor);
  const fleetDriversQuery = useVendorFleetDriversQuery(isVendor);
  const fleetVehiclesQuery = useVendorFleetVehiclesQuery(isVendor);

  const acceptMutation = useAcceptDriverJobMutation();
  const rejectMutation = useRejectDriverJobMutation();
  const assignMutation = useAssignVendorBookingMutation();

  const [actingId, setActingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const offers: DriverJobBooking[] = isVendor
    ? (vendorOffersQuery.data ?? [])
    : (driverOffersQuery.data ?? []);
  const myJobs: DriverJobBooking[] = isDriver ? (driverJobsQuery.data ?? []) : [];

  const pendingApproval =
    isPendingApprovalError(driverJobsQuery.error) ||
    isPendingApprovalError(driverOffersQuery.error) ||
    isPendingApprovalError(vendorOffersQuery.error);

  const loadError =
    (!pendingApproval &&
      (driverJobsQuery.error ||
        driverOffersQuery.error ||
        vendorOffersQuery.error ||
        fleetDriversQuery.error)) ||
    null;

  const isLoading = isVendor
    ? vendorOffersQuery.isLoading
    : driverJobsQuery.isLoading && driverOffersQuery.isLoading;

  const isRefetching = isVendor
    ? vendorOffersQuery.isRefetching ||
      fleetDriversQuery.isRefetching ||
      fleetVehiclesQuery.isRefetching
    : driverJobsQuery.isRefetching || driverOffersQuery.isRefetching;

  const refetchAll = () => {
    if (isVendor) {
      void vendorOffersQuery.refetch();
      void fleetDriversQuery.refetch();
      void fleetVehiclesQuery.refetch();
    } else if (isDriver) {
      void driverJobsQuery.refetch();
      void driverOffersQuery.refetch();
    }
  };

  const assigningOffer = useMemo(
    () => offers.find(o => o.id === assigningId) ?? null,
    [offers, assigningId],
  );

  const fleetDrivers = fleetDriversQuery.data ?? [];
  const fleetVehicles = fleetVehiclesQuery.data ?? [];

  const driversForAssign = useMemo(() => {
    if (!assigningOffer) return [];
    return eligibleDrivers(fleetDrivers, assigningOffer.bookingType);
  }, [assigningOffer, fleetDrivers]);

  useEffect(() => {
    if (!assigningOffer) return;
    const eligible = eligibleDrivers(fleetDrivers, assigningOffer.bookingType);
    setSelectedDriverId(prev =>
      eligible.some(d => d.id === prev) ? prev : eligible[0]?.id || '',
    );
    setSelectedVehicleId(prev =>
      fleetVehicles.some(v => v.id === prev) ? prev : fleetVehicles[0]?.id || '',
    );
  }, [assigningOffer, fleetDrivers, fleetVehicles]);

  const onAccept = async (job: DriverJobBooking) => {
    setActingId(job.id);
    try {
      await acceptMutation.mutateAsync({ bookingId: job.id, bookingType: job.bookingType });
      navigation.navigate('PartnerActiveJob', {
        bookingId: job.id,
        bookingType: job.bookingType,
      });
    } catch (error) {
      Alert.alert('Accept failed', getApiErrorMessage(error, 'Could not accept job'));
      refetchAll();
    } finally {
      setActingId(null);
    }
  };

  const onReject = (job: DriverJobBooking) => {
    Alert.alert('Reject job?', 'This booking will go back to the open pool.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setActingId(job.id);
            try {
              await rejectMutation.mutateAsync({
                bookingId: job.id,
                bookingType: job.bookingType,
              });
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

  const onVendorAssign = async () => {
    if (!assigningOffer || !selectedDriverId) {
      Alert.alert('Select a driver', 'Choose an eligible fleet driver for this service.');
      return;
    }
    setActingId(assigningOffer.id);
    try {
      const result = await assignMutation.mutateAsync({
        bookingId: assigningOffer.id,
        bookingType: assigningOffer.bookingType,
        driverId: selectedDriverId,
        vehicleId: selectedVehicleId || undefined,
      });
      setAssigningId(null);
      Alert.alert(
        'Assigned',
        result.message ||
          `Assigned ${result.driver?.name || 'driver'} — customer can see partner details now.`,
      );
    } catch (error) {
      Alert.alert('Assign failed', getApiErrorMessage(error, 'Could not assign driver'));
      refetchAll();
    } finally {
      setActingId(null);
    }
  };

  const subtitle = isVendor
    ? 'Select a driver and vehicle for each customer request'
    : isDriver
      ? 'Nearby open requests and your allotted jobs'
      : 'Sign in as a vendor or driver to see jobs';

  return (
    <AppScreenLayout
      header={
        <View style={styles.headerPad}>
          <Text style={styles.title}>Jobs</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      }
      scrollable={false}
      contentStyle={styles.content}>
      {!isDriver && !isVendor ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Partner jobs</Text>
          <Text style={styles.emptySubtitle}>
            Sign in as a vendor or driver to see customer requests.
          </Text>
        </View>
      ) : pendingApproval ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Waiting for approval</Text>
          <Text style={styles.emptySubtitle}>
            Your account is pending admin approval. Jobs will appear here once approved.
          </Text>
        </View>
      ) : isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />
          }>
          {loadError ? (
            <Text style={styles.errorText}>
              {getApiErrorMessage(loadError, 'Unable to load jobs')}
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>
            {isVendor ? 'Open customer requests' : 'Nearby requests'}
          </Text>
          {offers.length === 0 ? (
            <View style={styles.emptyInline}>
              <View style={styles.iconWrap}>
                <Navigation size={36} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>No open requests</Text>
              <Text style={styles.emptySubtitle}>
                When a customer books towing or a driver near you, it shows up here.
              </Text>
            </View>
          ) : (
            offers.map(job => {
              const busy = actingId === job.id;
              const isAssigning = assigningId === job.id;
              return (
                <GlassCard key={`offer-${job.bookingType}-${job.id}`} style={styles.jobCard}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobNumber}>#{job.bookingNumber}</Text>
                    <View style={styles.typePill}>
                      <Text style={styles.typePillText}>
                        {job.serviceLabel ||
                          (job.bookingType === 'towing' ? 'Towing' : 'Driver')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.status}>Open · waiting for partner</Text>
                  <Text style={styles.address}>
                    Pickup:{' '}
                    {formatReadableAddress(job.pickup?.address || job.pickup?.label)}
                  </Text>
                  {job.dropoff ? (
                    <Text style={styles.address}>
                      Drop: {formatReadableAddress(job.dropoff.address || job.dropoff.label)}
                    </Text>
                  ) : null}
                  {typeof job.distanceKm === 'number' ? (
                    <Text style={styles.meta}>{job.distanceKm.toFixed(1)} km away</Text>
                  ) : null}
                  {typeof job.estimatedFare === 'number' ? (
                    <Text style={styles.fare}>Est. ₹{Math.round(job.estimatedFare)}</Text>
                  ) : null}

                  {isVendor ? (
                    <>
                      <Pressable
                        disabled={busy}
                        onPress={() =>
                          setAssigningId(prev => (prev === job.id ? null : job.id))
                        }
                        style={[styles.acceptBtn, busy && styles.disabled]}>
                        <Text style={styles.acceptLabel}>
                          {isAssigning ? 'Cancel assign' : 'Assign driver'}
                        </Text>
                      </Pressable>

                      {isAssigning ? (
                        <View style={styles.assignPanel}>
                          <Text style={styles.assignLabel}>Eligible drivers</Text>
                          {driversForAssign.length === 0 ? (
                            <Text style={styles.emptySubtitle}>
                              No free drivers match this service. Add a{' '}
                              {job.bookingType === 'towing' ? 'Tow Driver' : 'Full/Part-Time'}{' '}
                              under My Drivers.
                            </Text>
                          ) : (
                            driversForAssign.map(driver => {
                              const selected = selectedDriverId === driver.id;
                              return (
                                <Pressable
                                  key={driver.id}
                                  onPress={() => setSelectedDriverId(driver.id)}
                                  style={[
                                    styles.optionRow,
                                    selected && styles.optionRowSelected,
                                  ]}>
                                  <Text style={styles.optionTitle}>{driver.name}</Text>
                                  <Text style={styles.optionMeta}>
                                    {driver.driverType} · {driver.phone}
                                  </Text>
                                </Pressable>
                              );
                            })
                          )}

                          <Text style={[styles.assignLabel, { marginTop: spacing.md }]}>
                            Fleet vehicle (optional)
                          </Text>
                          {fleetVehicles.length === 0 ? (
                            <Text style={styles.emptySubtitle}>
                              No active fleet vehicles. You can still assign a driver.
                            </Text>
                          ) : (
                            fleetVehicles.map(vehicle => {
                              const selected = selectedVehicleId === vehicle.id;
                              return (
                                <Pressable
                                  key={vehicle.id}
                                  onPress={() =>
                                    setSelectedVehicleId(prev =>
                                      prev === vehicle.id ? '' : vehicle.id,
                                    )
                                  }
                                  style={[
                                    styles.optionRow,
                                    selected && styles.optionRowSelected,
                                  ]}>
                                  <Text style={styles.optionTitle}>
                                    {vehicle.registrationNo}
                                  </Text>
                                  <Text style={styles.optionMeta}>
                                    {vehicle.type} · {vehicle.model}
                                  </Text>
                                </Pressable>
                              );
                            })
                          )}

                          <Pressable
                            disabled={busy || !selectedDriverId}
                            onPress={() => void onVendorAssign()}
                            style={[
                              styles.acceptBtn,
                              (busy || !selectedDriverId) && styles.disabled,
                            ]}>
                            <Text style={styles.acceptLabel}>
                              {busy ? 'Assigning…' : 'Confirm assignment'}
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </>
                  ) : (
                    <View style={styles.actions}>
                      <Pressable
                        disabled={busy}
                        onPress={() => void onAccept(job)}
                        style={[styles.acceptBtn, busy && styles.disabled]}>
                        <Text style={styles.acceptLabel}>{busy ? '…' : 'Accept'}</Text>
                      </Pressable>
                      <Pressable
                        disabled={busy}
                        onPress={() => onReject(job)}
                        style={[styles.rejectBtn, busy && styles.disabled]}>
                        <Text style={styles.rejectLabel}>Reject</Text>
                      </Pressable>
                    </View>
                  )}
                </GlassCard>
              );
            })
          )}

          {isDriver ? (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>My jobs</Text>
              {myJobs.length === 0 ? (
                <Text style={styles.emptySubtitle}>No allotted jobs yet.</Text>
              ) : (
                myJobs.map(job => {
                  const canDecide = job.status === 'DRIVER_ASSIGNED';
                  const isActive = ACTIVE_STATUSES.has(job.status);
                  const busy = actingId === job.id;
                  return (
                    <GlassCard key={`mine-${job.bookingType}-${job.id}`} style={styles.jobCard}>
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
                        Pickup:{' '}
                        {formatReadableAddress(job.pickup?.address || job.pickup?.label)}
                      </Text>
                      {typeof job.estimatedFare === 'number' ? (
                        <Text style={styles.fare}>Est. ₹{Math.round(job.estimatedFare)}</Text>
                      ) : null}
                      {canDecide ? (
                        <View style={styles.actions}>
                          <Pressable
                            disabled={busy}
                            onPress={() => void onAccept(job)}
                            style={[styles.acceptBtn, busy && styles.disabled]}>
                            <Text style={styles.acceptLabel}>{busy ? '…' : 'Accept'}</Text>
                          </Pressable>
                          <Pressable
                            disabled={busy}
                            onPress={() => onReject(job)}
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
                })
              )}
            </>
          ) : null}
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
  sectionTitle: {
    color: colors.dark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
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
  meta: { color: colors.grey, fontSize: typography.sizes.xs },
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
    marginTop: spacing.md,
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
    marginTop: spacing.md,
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
  assignPanel: {
    marginTop: spacing.sm,
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  assignLabel: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  optionRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.goldLight,
  },
  optionTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  optionMeta: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  disabled: { opacity: 0.5 },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxxl,
  },
  emptyInline: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
});
