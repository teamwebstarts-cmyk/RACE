import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthToast from '../../components/auth/AuthToast';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import { useVehicleStore } from '../../store/vehicleStore';
import type { ProfileStackParamList } from '../../types/navigation';
import type { FuelType, VehicleType } from '../../types/vehicle';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditVehicle'>;

const VEHICLE_TYPES: VehicleType[] = ['car', 'bike', 'truck', 'bus', 'other'];
const FUEL_TYPES: FuelType[] = ['petrol', 'diesel', 'cng', 'electric', 'hybrid', 'other'];

export default function EditVehicleScreen({ navigation, route }: Props) {
  const { vehicleId } = route.params;
  const { selectedVehicle, fetchVehicle, updateVehicle, isLoading, error: storeError } =
    useVehicleStore();

  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchVehicle(vehicleId);
  }, [fetchVehicle, vehicleId]);

  useEffect(() => {
    if (!selectedVehicle || selectedVehicle.id !== vehicleId) return;
    setVehicleType(selectedVehicle.vehicleType);
    setFuelType(selectedVehicle.fuelType);
    setVehicleNumber(selectedVehicle.vehicleNumber);
    setBrand(selectedVehicle.brand);
    setModel(selectedVehicle.model);
    setColor(selectedVehicle.color ?? '');
  }, [selectedVehicle, vehicleId]);

  const handleSubmit = async () => {
    setError('');
    if (!vehicleNumber.trim() || !brand.trim() || !model.trim()) {
      setError('Vehicle number, brand, and model are required');
      return;
    }

    try {
      await updateVehicle(vehicleId, {
        vehicleType,
        fuelType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        color: color.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update vehicle');
    }
  };

  if (isLoading && !selectedVehicle) {
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
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ScreenContent>
              <Text style={styles.title}>Edit Vehicle</Text>

              <ChipRow label="Vehicle Type" options={VEHICLE_TYPES} value={vehicleType} onChange={setVehicleType} />
              <ChipRow label="Fuel Type" options={FUEL_TYPES} value={fuelType} onChange={setFuelType} />

              <Field label="Vehicle Number" value={vehicleNumber} onChangeText={setVehicleNumber} placeholder="OD02AB1234" autoCapitalize="characters" />
              <Field label="Brand" value={brand} onChangeText={setBrand} placeholder="Hyundai" />
              <Field label="Model" value={model} onChangeText={setModel} placeholder="i20" />
              <Field label="Color (optional)" value={color} onChangeText={setColor} placeholder="White" />

              <AuthToast message={error || storeError || ''} />

              <PrimaryButton
                label={isLoading ? 'Saving...' : 'Update Vehicle'}
                onPress={() => void handleSubmit()}
                disabled={isLoading}
              />
            </ScreenContent>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'characters';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => (
          <Text
            key={option}
            onPress={() => onChange(option)}
            style={[styles.chip, value === option && styles.chipActive]}>
            {option}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: spacing.xxl },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  field: { marginBottom: spacing.md },
  label: {
    color: colors.textDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSoft,
    color: colors.textDark,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundSoft,
    textTransform: 'capitalize',
    color: colors.textDark,
  },
  chipActive: {
    backgroundColor: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
