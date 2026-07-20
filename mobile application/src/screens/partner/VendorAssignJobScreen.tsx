import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, Plus, Truck } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import AppScreenLayout from '../../components/ui/AppScreenLayout';
import { getApiErrorMessage } from '../../services/auth/useAuthMutations';
import {
  useApproveVendorBookingMutation,
  useVendorFleetVehiclesQuery,
} from '../../services/vendor/useVendorBookingsQueries';
import { formatReadableAddress } from '../../utils/readableAddress';
import type { PartnerJobsStackParamList } from '../../types/partnerNavigation';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PartnerJobsStackParamList, 'VendorAssignJob'>;

export default function VendorAssignJobScreen({ navigation, route }: Props) {
  const { bookingId, bookingType, bookingNumber, serviceLabel, pickupAddress, estimatedFare } =
    route.params;

  const { data: vehicles = [], isLoading: vehiclesLoading } = useVendorFleetVehiclesQuery(true);
  const approveMutation = useApproveVendorBookingMutation();

  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const onApprove = async () => {
    if (!vehicleId) {
      Alert.alert('Select a vehicle', 'Choose a vendor vehicle for this job.');
      return;
    }
    try {
      const result = await approveMutation.mutateAsync({
        bookingId,
        bookingType,
        vehicleId,
      });
      Alert.alert(
        'Job approved',
        result.message ||
          `Vehicle assigned — your drivers can accept #${bookingNumber} from their jobs list.`,
        [{ text: 'OK', onPress: () => navigation.navigate('PartnerJobsList') }],
      );
    } catch (error) {
      Alert.alert('Approval failed', getApiErrorMessage(error, 'Could not approve job'));
    }
  };

  return (
    <AppScreenLayout
      header={
        <View style={styles.headerPad}>
          <Text style={styles.title}>Approve job</Text>
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

        <Text style={styles.hint}>
          Approve this request and assign a vehicle. Your vendor drivers will see it and can accept
          the trip themselves — no need to pick a driver here.
        </Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select vehicle</Text>
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
              No active vendor vehicles. Add a vehicle before approving jobs.
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

        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton
            label={approveMutation.isPending ? 'Approving…' : 'Approve & assign vehicle'}
            onPress={() => void onApprove()}
            disabled={approveMutation.isPending || !vehicleId}
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
  hint: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
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
