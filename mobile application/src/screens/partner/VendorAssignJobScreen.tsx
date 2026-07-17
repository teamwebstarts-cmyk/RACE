import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, Plus, Truck, User } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';
import type { FleetDriver } from '../../services/vendor/vendorDriversApi';
import {
  useAssignVendorBookingMutation,
  useVendorFleetDriversQuery,
  useVendorFleetVehiclesQuery,
} from '../../services/vendor/useVendorBookingsQueries';
import { formatReadableAddress } from '../../utils/readableAddress';
import type { PartnerJobsStackParamList } from '../../types/partnerNavigation';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerJobsStackParamList, 'VendorAssignJob'>;

function eligibleDrivers(drivers: FleetDriver[], bookingType: 'towing' | 'driver') {
  return drivers.filter(d => {
    if (d.isBusy) return false;
    const type = d.driverType.toLowerCase();
    if (bookingType === 'towing') return type.includes('tow');
    return type.includes('full') || type.includes('part');
  });
}

export default function VendorAssignJobScreen({ navigation, route }: Props) {
  const { bookingId, bookingType, bookingNumber, serviceLabel, pickupAddress, estimatedFare } =
    route.params;

  const { data: vehicles = [], isLoading: vehiclesLoading } = useVendorFleetVehiclesQuery(true);
  const { data: drivers = [], isLoading: driversLoading } = useVendorFleetDriversQuery(true);
  const assignMutation = useAssignVendorBookingMutation();

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  const availableDrivers = useMemo(
    () => eligibleDrivers(drivers, bookingType),
    [drivers, bookingType],
  );

  const onAssign = async () => {
    if (!driverId) {
      Alert.alert('Select a driver', 'Choose a fleet driver to assign this job.');
      return;
    }
    if (bookingType === 'towing' && vehicles.length > 0 && !vehicleId) {
      Alert.alert('Select a vehicle', 'Choose a fleet vehicle for this tow job, or add one first.');
      return;
    }
    try {
      const result = await assignMutation.mutateAsync({
        bookingId,
        bookingType,
        driverId,
        vehicleId: vehicleId ?? undefined,
      });
      Alert.alert(
        'Assigned',
        result.message ||
          `Assigned ${result.driver?.name || 'driver'} — customer can see partner details now.`,
        [{ text: 'OK', onPress: () => navigation.navigate('PartnerJobsList') }],
      );
    } catch (error) {
      Alert.alert('Assign failed', getApiErrorMessage(error, 'Could not assign job'));
    }
  };

  return (
    <AppScreenLayout
      header={
        <View style={styles.headerPad}>
          <Text style={styles.title}>Assign job</Text>
          <Text style={styles.subtitle}>
            #{bookingNumber} · {serviceLabel}
          </Text>
        </View>
      }>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pickup</Text>
          <Text style={styles.summaryValue}>
            {formatReadableAddress(pickupAddress) || 'Pickup location'}
          </Text>
          {typeof estimatedFare === 'number' ? (
            <Text style={styles.fare}>Est. ₹{Math.round(estimatedFare)}</Text>
          ) : null}
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1. Select vehicle</Text>
          <Pressable onPress={() => navigation.navigate('VendorVehicles')} style={styles.addLink}>
            <Plus size={14} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.addLinkText}>Add vehicle</Text>
          </Pressable>
        </View>

        {vehiclesLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : vehicles.length === 0 ? (
          <GlassCard>
            <Text style={styles.emptyText}>
              No active fleet vehicles. Add a vehicle first for towing jobs.
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <PrimaryButton
                label="Add vehicle"
                onPress={() => navigation.navigate('VendorVehicles')}
              />
            </View>
          </GlassCard>
        ) : (
          vehicles.map(vehicle => {
            const selected = vehicleId === vehicle.id;
            return (
              <Pressable
                key={vehicle.id}
                onPress={() => setVehicleId(vehicle.id)}
                style={[styles.optionCard, selected && styles.optionCardSelected]}>
                <View style={styles.optionIcon}>
                  <Truck size={18} color={colors.primary} strokeWidth={2.2} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{vehicle.registrationNo}</Text>
                  <Text style={styles.optionMeta}>
                    {vehicle.type} · {vehicle.model}
                  </Text>
                </View>
                {selected ? <Check size={18} color={colors.primary} strokeWidth={2.8} /> : null}
              </Pressable>
            );
          })
        )}

        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={styles.sectionTitle}>2. Select driver</Text>
          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate('PartnerAccount', {
                screen: 'VendorDrivers',
              } as never)
            }
            style={styles.addLink}>
            <Plus size={14} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.addLinkText}>Add driver</Text>
          </Pressable>
        </View>

        {driversLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : availableDrivers.length === 0 ? (
          <GlassCard>
            <Text style={styles.emptyText}>
              No available drivers for this job type. Add a{' '}
              {bookingType === 'towing' ? 'Tow Driver' : 'Full/Part-Time'} under My Drivers.
            </Text>
          </GlassCard>
        ) : (
          availableDrivers.map(driver => {
            const selected = driverId === driver.id;
            return (
              <Pressable
                key={driver.id}
                onPress={() => setDriverId(driver.id)}
                style={[styles.optionCard, selected && styles.optionCardSelected]}>
                <View style={styles.optionIcon}>
                  <User size={18} color={colors.primary} strokeWidth={2.2} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{driver.name}</Text>
                  <Text style={styles.optionMeta}>
                    {driver.driverType} · {driver.phone}
                  </Text>
                </View>
                {selected ? <Check size={18} color={colors.primary} strokeWidth={2.8} /> : null}
              </Pressable>
            );
          })
        )}

        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton
            label={assignMutation.isPending ? 'Assigning…' : 'Assign via fleet'}
            onPress={() => void onAssign()}
            disabled={assignMutation.isPending || !driverId}
          />
        </View>
      </ScrollView>
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
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  summaryCard: { marginBottom: spacing.md },
  summaryLabel: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  summaryValue: {
    marginTop: 4,
    color: colors.dark,
    fontWeight: typography.weights.semibold,
  },
  fare: {
    marginTop: spacing.sm,
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
  },
  addLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addLinkText: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.goldLight,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: { flex: 1 },
  optionTitle: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  optionMeta: {
    marginTop: 2,
    color: colors.grey,
    fontSize: typography.sizes.sm,
  },
  emptyText: {
    color: colors.grey,
    lineHeight: 20,
  },
});
