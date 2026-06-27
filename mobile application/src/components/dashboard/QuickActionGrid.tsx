import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '../../theme';

const ACTIONS = [
  { id: 'tow', label: 'Tow Vehicle', icon: 'car-outline' as const },
  { id: 'driver', label: 'Driver', icon: 'person-outline' as const },
  { id: 'tyre', label: 'Flat Tyre', icon: 'disc-outline' as const },
  { id: 'fuel', label: 'Fuel', icon: 'water-outline' as const },
  { id: 'battery', label: 'Jump Start', icon: 'battery-charging-outline' as const },
];

interface QuickActionGridProps {
  onAction: (actionId: string) => void;
}

export default function QuickActionGrid({ onAction }: QuickActionGridProps) {
  return (
    <View style={styles.grid}>
      {ACTIONS.map((action) => (
        <TouchableOpacity key={action.id} style={styles.item} onPress={() => onAction(action.id)}>
          <View style={styles.iconWrap}>
            <Ionicons name={action.icon} size={22} color={colors.secondary} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '31%',
    minWidth: 100,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textLight,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
