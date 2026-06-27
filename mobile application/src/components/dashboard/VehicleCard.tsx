import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GlassCard from '../ui/GlassCard';
import type { Vehicle } from '../../types/vehicle';
import { colors, radius, spacing, typography } from '../../theme';

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewQr: () => void;
  onEdit: () => void;
  onBook: () => void;
}

export default function VehicleCard({ vehicle, onViewQr, onEdit, onBook }: VehicleCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        {vehicle.photo ? (
          <Image source={{ uri: vehicle.photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="car-sport" size={28} color={colors.secondary} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.plate}>{vehicle.vehicleNumber}</Text>
          <Text style={styles.meta}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text style={styles.metaSmall}>
            {vehicle.vehicleType} · {vehicle.fuelType}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton icon="qr-code" label="View QR" onPress={onViewQr} />
        <ActionButton icon="create-outline" label="Edit" onPress={onEdit} />
        <ActionButton icon="flash" label="Book" onPress={onBook} primary />
      </View>
    </GlassCard>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.actionBtn, primary && styles.actionBtnPrimary]}>
      <Ionicons name={icon} size={16} color={primary ? colors.textLight : colors.secondary} />
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  photo: { width: 72, height: 72, borderRadius: radius.card },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  info: { flex: 1, justifyContent: 'center' },
  plate: { color: colors.textLight, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  meta: { color: colors.subtext, marginTop: 2, textTransform: 'capitalize' },
  metaSmall: { color: colors.subtext, fontSize: typography.sizes.sm, marginTop: 2, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  actionBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionText: { color: colors.secondary, fontWeight: typography.weights.bold, fontSize: typography.sizes.sm },
  actionTextPrimary: { color: colors.textLight },
});
