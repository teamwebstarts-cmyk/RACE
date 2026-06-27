import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import { useVehicleStore } from '../../store/vehicleStore';
import type { ProfileStackParamList } from '../../types/navigation';
import type { Vehicle } from '../../types/vehicle';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyVehicles'>;

export default function VehicleListScreen({ navigation }: Props) {
  const { vehicles, isLoading, error, fetchVehicles, deleteVehicle } = useVehicleStore();

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete vehicle', 'Remove this vehicle from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteVehicle(id);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Vehicle }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item.id })}
      onLongPress={() => handleDelete(item.id)}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <Text style={styles.plate}>{item.vehicleNumber}</Text>
        <Text style={styles.meta}>
          {item.brand} {item.model} · {item.vehicleType.toUpperCase()}
        </Text>
        <Text style={styles.fuel}>{item.fuelType}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea}>
        <ScreenContent>
          <Text style={styles.title}>My Vehicles</Text>
          <Text style={styles.subtitle}>Manage vehicles linked to your RACE account.</Text>

          {isLoading && !vehicles.length ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={vehicles}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              refreshing={isLoading}
              onRefresh={() => void fetchVehicles()}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    {error ?? 'No vehicles added yet.'}
                  </Text>
                </View>
              }
              contentContainerStyle={styles.list}
            />
          )}

          <PrimaryButton
            label="Add Vehicle"
            onPress={() => navigation.navigate('AddVehicle')}
          />
        </ScreenContent>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.text,
    marginBottom: spacing.lg,
  },
  loader: { marginTop: spacing.xxl },
  list: { paddingBottom: spacing.lg, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
  },
  cardBody: { flex: 1, padding: spacing.md },
  plate: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
  },
  meta: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.sizes.sm,
  },
  fuel: {
    marginTop: spacing.xs,
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  chevron: {
    fontSize: 24,
    color: colors.primary,
    paddingRight: spacing.md,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text,
    fontSize: typography.sizes.md,
  },
});
