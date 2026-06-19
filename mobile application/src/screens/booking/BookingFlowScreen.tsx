import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import FormField from '../../components/ui/FormField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ProgressStepper from '../../components/ui/ProgressStepper';
import Screen, { Card, ScreenContent } from '../../components/ui/Screen';
import { useAppDispatch } from '../../redux/hooks';
import { clearBookingDraft, updateBookingDraft } from '../../redux/bookings/bookingsSlice';
import { useCreateBookingMutation } from '../../services/bookings/useBookingQueries';
import { useVehiclesQuery } from '../../services/vehicles/useVehicleQueries';
import type { BookingsStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingFlow'>;

const STEP_LABELS = [
  'Select Service',
  'Choose Vehicle',
  'Pickup Location',
  'Destination',
  'Summary',
  'Confirm',
];

export default function BookingFlowScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { categoryId, serviceId, serviceLabel, serviceDescription } = route.params;
  const { data: vehicles = [] } = useVehiclesQuery();
  const createBooking = useCreateBookingMutation();

  const [step, setStep] = useState(1);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? '');
  const [pickupLabel, setPickupLabel] = useState('Patia Square');
  const [pickupAddress, setPickupAddress] = useState('Patia Square, Bhubaneswar');
  const [dropLabel, setDropLabel] = useState('Cuttack Road');
  const [dropAddress, setDropAddress] = useState('Cuttack Road, Bhubaneswar');

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const estimatedTotal = categoryId === 'towing' ? 899 : categoryId === 'driver' ? 499 : 299;

  const handleConfirm = async () => {
    if (!selectedVehicle) return;
    const booking = await createBooking.mutateAsync({
      payload: {
        categoryId,
        serviceId,
        serviceLabel,
        serviceDescription,
        vehicleId: selectedVehicle.id,
        pickup: { label: pickupLabel, address: pickupAddress },
        dropoff: categoryId === 'towing' ? { label: dropLabel, address: dropAddress } : undefined,
        estimatedTotal,
      },
      vehicleNumber: selectedVehicle.vehicleNumber,
      vehicleLabel: `${selectedVehicle.brand} ${selectedVehicle.model}`,
    });
    dispatch(clearBookingDraft());
    navigation.replace('LiveTracking', { bookingId: booking.id });
  };

  const canContinue = () => {
    if (step === 2) return Boolean(vehicleId);
    if (step === 3) return pickupLabel.trim().length > 0;
    if (step === 4 && categoryId === 'towing') return dropLabel.trim().length > 0;
    return true;
  };

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <ProgressStepper currentStep={step} totalSteps={6} labels={STEP_LABELS} />

            {step === 1 && (
              <Card>
                <Text style={styles.stepTitle}>{serviceLabel}</Text>
                <Text style={styles.stepDesc}>{serviceDescription ?? 'Confirm this service to continue booking.'}</Text>
                <Text style={styles.price}>From ₹{estimatedTotal}</Text>
              </Card>
            )}

            {step === 2 && (
              <View style={styles.options}>
                {vehicles.length === 0 ? (
                  <Text style={styles.hint}>Add a vehicle from Profile → My Vehicles first.</Text>
                ) : (
                  vehicles.map((v) => (
                    <Pressable
                      key={v.id}
                      style={[styles.option, vehicleId === v.id && styles.optionActive]}
                      onPress={() => setVehicleId(v.id)}>
                      <Text style={styles.optionTitle}>{v.vehicleNumber}</Text>
                      <Text style={styles.optionSub}>{v.brand} {v.model}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {step === 3 && (
              <Card>
                <FormField label="Pickup Label" value={pickupLabel} onChangeText={setPickupLabel} />
                <FormField label="Pickup Address" value={pickupAddress} onChangeText={setPickupAddress} multiline />
              </Card>
            )}

            {step === 4 && (
              <Card>
                {categoryId === 'towing' ? (
                  <>
                    <FormField label="Drop Label" value={dropLabel} onChangeText={setDropLabel} />
                    <FormField label="Drop Address" value={dropAddress} onChangeText={setDropAddress} multiline />
                  </>
                ) : (
                  <Text style={styles.stepDesc}>No destination required for this service.</Text>
                )}
              </Card>
            )}

            {step === 5 && (
              <Card>
                <SummaryRow label="Service" value={serviceLabel} />
                <SummaryRow label="Vehicle" value={selectedVehicle?.vehicleNumber ?? '—'} />
                <SummaryRow label="Pickup" value={pickupLabel} />
                {categoryId === 'towing' ? <SummaryRow label="Drop" value={dropLabel} /> : null}
                <Text style={styles.total}>Total ₹{estimatedTotal}</Text>
              </Card>
            )}

            {step === 6 && (
              <Card style={styles.confirmCard}>
                <Text style={styles.confirmTitle}>Ready to confirm?</Text>
                <Text style={styles.stepDesc}>You won't be charged until service completes.</Text>
              </Card>
            )}

            <View style={styles.actions}>
              {step > 1 ? (
                <PrimaryButton label="Back" onPress={() => setStep((s) => s - 1)} variant="outline" />
              ) : null}
              {step < 6 ? (
                <PrimaryButton
                  label="Continue"
                  onPress={() => {
                    dispatch(updateBookingDraft({ categoryId, serviceId, serviceLabel, vehicleId }));
                    setStep((s) => s + 1);
                  }}
                  disabled={!canContinue()}
                />
              ) : (
                <PrimaryButton
                  label={createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
                  onPress={handleConfirm}
                  disabled={createBooking.isPending || !selectedVehicle}
                />
              )}
            </View>
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={summaryStyles.row}>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.value}>{value}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontSize: typography.sizes.md },
  value: { color: colors.textDark, fontWeight: typography.weights.semibold, flex: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  stepTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textDark },
  stepDesc: { marginTop: spacing.sm, color: colors.textMuted, lineHeight: 22 },
  price: { marginTop: spacing.md, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.primary },
  options: { gap: spacing.md },
  option: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: { borderColor: colors.primary, borderWidth: 2 },
  optionTitle: { fontWeight: typography.weights.bold, color: colors.textDark, fontSize: typography.sizes.lg },
  optionSub: { color: colors.textMuted, marginTop: spacing.xs },
  hint: { color: colors.textMuted, textAlign: 'center' },
  total: { marginTop: spacing.lg, fontSize: typography.sizes.xxl, fontWeight: typography.weights.extrabold, color: colors.primary },
  confirmCard: { alignItems: 'center' },
  confirmTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textDark },
  actions: { gap: spacing.md, marginTop: spacing.lg },
});
