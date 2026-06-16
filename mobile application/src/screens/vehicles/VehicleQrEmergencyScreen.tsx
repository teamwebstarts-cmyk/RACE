import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAppSelector } from '../../redux/hooks';
import { useVehicleQuery } from '../../services/vehicles/useVehicleQueries';
import type { HomeStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'VehicleQrEmergency'>;

export default function VehicleQrEmergencyScreen({ route }: Props) {
  const { vehicleId } = route.params;
  const { data: vehicle } = useVehicleQuery(vehicleId);
  const user = useAppSelector((state) => state.auth.user);

  const callNumber = (number?: string) => {
    if (!number) return;
    void Linking.openURL(`tel:+91${number.replace(/\D/g, '')}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="warning" size={16} color={colors.textLight} />
          <Text style={styles.badgeText}>Emergency QR</Text>
        </View>

        <GlassCard>
          {vehicle?.qrCode ? <Image source={{ uri: vehicle.qrCode }} style={styles.qr} /> : null}
          <Text style={styles.plate}>{vehicle?.vehicleNumber ?? '—'}</Text>
          <Text style={styles.meta}>
            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle information'}
          </Text>
        </GlassCard>

        <PrimaryButton label="Contact Owner" onPress={() => callNumber(user?.mobileNumber)} />
        <PrimaryButton
          label={`Emergency: ${user?.emergencyContact?.name ?? 'Contact'}`}
          onPress={() => callNumber(user?.emergencyContact?.mobileNumber)}
          variant="outline"
        />
        <PrimaryButton label="Request Towing" onPress={() => void Linking.openURL('tel:18001234567')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceDarker },
  content: { padding: spacing.lg },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    marginBottom: spacing.lg,
  },
  badgeText: { color: colors.textLight, fontWeight: typography.weights.bold },
  qr: { width: 220, height: 220, alignSelf: 'center' },
  plate: { color: colors.textLight, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginTop: spacing.md, textAlign: 'center' },
  meta: { color: colors.subtext, textAlign: 'center', marginTop: spacing.xs, textTransform: 'capitalize' },
});
