import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAppDispatch } from '../../redux/hooks';
import { completeOnboarding } from '../../redux/auth/authSlice';
import { finishVehicleOnboarding } from '../../redux/onboarding/onboardingSlice';
import { useVehicleQuery } from '../../services/vehicles/useVehicleQueries';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'VehicleSuccess'>;

export default function VehicleSuccessScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const { vehicleId, vehicleNumber } = route.params;
  const { data: vehicle } = useVehicleQuery(vehicleId);

  const handleContinue = () => {
    dispatch(finishVehicleOnboarding());
    dispatch(completeOnboarding());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.badge}>Vehicle Registered</Text>
        <Text style={styles.title}>{vehicleNumber}</Text>
        <Text style={styles.subtitle}>
          {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Your vehicle is ready for RACE services'}
        </Text>

        <GlassCard style={styles.card}>
          {vehicle?.qrCode ? (
            <Image source={{ uri: vehicle.qrCode }} style={styles.qr} resizeMode="contain" />
          ) : null}
          <Text style={styles.qrHint}>Emergency QR generated. Technicians can scan this at roadside.</Text>
        </GlassCard>

        <PrimaryButton label="Continue to Dashboard" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.pageBg },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  badge: {
    color: colors.success,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: colors.dark,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    marginTop: spacing.sm,
  },
  subtitle: { color: colors.grey, marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 20 },
  card: { alignItems: 'center', marginBottom: spacing.lg },
  qr: { width: 220, height: 220 },
  qrHint: { color: colors.grey, textAlign: 'center', marginTop: spacing.md, lineHeight: 20 },
});
