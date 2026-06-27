import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FormField from '../../ui/FormField';
import { colors, radius, spacing, typography } from '../../../theme';
import type { VendorDraft } from '../../../types/vendor';

const VEHICLE_TYPES = ['flatbed', 'hook', 'wheel-lift', 'integrated', 'other'];

interface Props {
  draft: VendorDraft;
  onChange: (patch: Partial<VendorDraft>) => void;
}

export default function VehicleInfoStep({ draft, onChange }: Props) {
  const vehicle = draft.towVehicle ?? {
    registrationNumber: '',
    vehicleType: 'flatbed',
    capacity: '',
    photos: [],
  };

  const updateVehicle = (patch: Partial<typeof vehicle>) => {
    onChange({ towVehicle: { ...vehicle, ...patch } });
  };

  return (
    <View>
      <Text style={styles.title}>Tow Vehicle Information</Text>
      <FormField
        dark
        label="Vehicle Registration Number"
        value={vehicle.registrationNumber}
        onChangeText={(v) => updateVehicle({ registrationNumber: v.toUpperCase() })}
        autoCapitalize="characters"
      />
      <Text style={styles.label}>Vehicle Type</Text>
      <View style={styles.chipRow}>
        {VEHICLE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => updateVehicle({ vehicleType: type })}
            style={[styles.chip, vehicle.vehicleType === type && styles.chipActive]}>
            <Text style={[styles.chipText, vehicle.vehicleType === type && styles.chipTextActive]}>
              {type.replace(/-/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FormField
        dark
        label="Vehicle Capacity"
        value={vehicle.capacity ?? ''}
        onChangeText={(v) => updateVehicle({ capacity: v })}
        placeholder="e.g. 5 tons"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textLight,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  label: { color: colors.subtext, marginBottom: spacing.xs, fontWeight: typography.weights.semibold },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.subtext, textTransform: 'capitalize' },
  chipTextActive: { color: colors.textLight, fontWeight: typography.weights.bold },
});
