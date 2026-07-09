import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import StatusChip from '../ui/StatusChip';
import type { Booking } from '../../types/booking';
import { formatLocationDisplay } from '../../utils/readableAddress';
import { colors, radius, spacing, typography } from '../../theme';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  compact?: boolean;
}

export default function BookingCard({ booking, onPress, compact }: BookingCardProps) {
  const content = (
    <View style={[styles.card, compact && styles.compact]}>
      <View style={styles.header}>
        <Text style={styles.id}>#{booking.bookingNumber}</Text>
        <StatusChip status={booking.status} compact />
      </View>
      <Text style={styles.service}>{booking.serviceLabel}</Text>
      <View style={styles.row}>
        <Ionicons name="location" size={14} color={colors.primary} />
        <Text style={styles.location} numberOfLines={1}>
          {formatLocationDisplay(booking.pickup)}
        </Text>
      </View>
      {booking.dropoff ? (
        <View style={styles.row}>
          <Ionicons name="navigate" size={14} color={colors.accentRed} />
          <Text style={styles.location} numberOfLines={1}>
            {formatLocationDisplay(booking.dropoff)}
          </Text>
        </View>
      ) : null}
      {booking.invoice && compact ? (
        <Text style={styles.price}>₹{booking.invoice.total}</Text>
      ) : null}
      {booking.etaMinutes && !compact && booking.status === 'EN_ROUTE' ? (
        <Text style={styles.eta}>Est. arrival {booking.etaMinutes} min</Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compact: {
    borderLeftWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.9 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  id: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: typography.weights.semibold,
  },
  service: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  location: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  price: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  eta: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
