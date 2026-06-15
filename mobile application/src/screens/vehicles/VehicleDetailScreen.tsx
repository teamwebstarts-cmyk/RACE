import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import {
  getApiErrorMessage,
  useDeleteVehicleMutation,
  useVehicleQuery,
} from '../../services/vehicles/useVehicleQueries';
import type { ProfileStackParamList } from '../../types/navigation';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'VehicleDetail'>;

export default function VehicleDetailScreen({ navigation, route }: Props) {
  const { vehicleId } = route.params;
  const { data: vehicle, isLoading } = useVehicleQuery(vehicleId);
  const deleteMutation = useDeleteVehicleMutation();
  const [error, setError] = useState('');

  const handleDelete = () => {
    Alert.alert('Delete vehicle', 'Remove this vehicle from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(vehicleId);
            navigation.navigate('MyVehicles');
          } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to delete vehicle'));
          }
        },
      },
    ]);
  };

  if (isLoading || !vehicle) {
    return (
      <Screen>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenContent>
            <View style={styles.card}>
              <Text style={styles.plate}>{vehicle.vehicleNumber}</Text>
              <Text style={styles.meta}>
                {vehicle.brand} {vehicle.model}
              </Text>
              <Text style={styles.meta}>
                {vehicle.vehicleType} · {vehicle.fuelType}
                {vehicle.color ? ` · ${vehicle.color}` : ''}
              </Text>
            </View>

            <Text style={styles.qrTitle}>Vehicle QR Code</Text>
            <Text style={styles.qrHint}>
              Technicians can scan this to verify your vehicle on RACE. Keep it on your windshield
              or share from this screen.
            </Text>
            <View style={styles.qrWrap}>
              <Image source={{ uri: vehicle.qrCode }} style={styles.qrImage} resizeMode="contain" />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <PrimaryButton
              label={deleteMutation.isPending ? 'Deleting...' : 'Delete Vehicle'}
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
              variant="outline"
            />
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 195, 38, 0.25)',
  },
  plate: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
  },
  meta: {
    marginTop: spacing.xs,
    color: colors.text,
    textTransform: 'capitalize',
  },
  qrTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  qrHint: {
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  qrWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  error: {
    color: colors.accentRed,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
