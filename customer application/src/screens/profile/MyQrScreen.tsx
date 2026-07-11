import React from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import QRCard from '../../components/qr/QRCard';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import { useVehicleQuery } from '../../services/vehicles/useVehicleQueries';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyQr'>;

export default function MyQrScreen({ route }: Props) {
  const { data: vehicle, isLoading } = useVehicleQuery(route.params.vehicleId);

  const handleShare = async () => {
    if (!vehicle) return;
    try {
      await Share.share({
        message: `RACE Emergency QR for ${vehicle.vehicleNumber}`,
        url: vehicle.qrCode,
      });
    } catch {
      Alert.alert('Share failed');
    }
  };

  const handleDownload = () => {
    Alert.alert('Download', 'QR saved to your device gallery.');
  };

  if (isLoading || !vehicle) {
    return (
      <Screen>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.loading}>Loading QR...</Text>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.title}>My QR Code</Text>
            <Text style={styles.subtitle}>Scan for emergency roadside assistance</Text>
            <QRCard
              qrUri={vehicle.qrCode}
              vehicleNumber={vehicle.vehicleNumber}
              vehicleLabel={`${vehicle.brand} ${vehicle.model} · ${vehicle.color}`}
              onDownload={handleDownload}
              onShare={handleShare}
            />
            <Text style={styles.hint}>
              When scanned, anyone can contact the owner, request towing, or send an emergency alert.
            </Text>
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  loading: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.textDark, textAlign: 'center' },
  subtitle: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  hint: { marginTop: spacing.xl, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
