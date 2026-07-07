import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { Card, ScreenContent } from '../../components/ui/Screen';
import { useAppDispatch } from '../../redux/hooks';
import { updateBookingStatus } from '../../redux/bookings/bookingsSlice';
import type { BookingStatus } from '../../types/booking';
import { useBookingQuery } from '../../services/bookings/useBookingQueries';
import { trackingService } from '../../services/tracking/trackingService';
import type { BookingsStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingsStackParamList, 'LiveTracking'>;

export default function LiveTrackingScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const booking = useBookingQuery(route.params.bookingId);
  const [eta, setEta] = useState(booking?.etaMinutes ?? 25);

  useEffect(() => {
    if (!booking) return;
    trackingService.connect();
    const unsubscribe = trackingService.subscribe(booking.id, (update) => {
      setEta(update.etaMinutes);
      dispatch(
        updateBookingStatus({
          id: booking.id,
          status: update.status as BookingStatus,
          etaMinutes: update.etaMinutes,
        }),
      );
    });
    return () => {
      unsubscribe();
    };
  }, [booking, dispatch]);

  if (!booking) {
    return (
      <Screen>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.missing}>Booking not found</Text>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <View style={styles.map}>
          <View style={styles.mapOverlay}>
            <Text style={styles.mapTitle}>Live Tracking</Text>
            <Text style={styles.mapSub}>#{booking.bookingNumber} · {booking.serviceLabel}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={[styles.marker, styles.pickup]}>
            <Text style={styles.markerLabel}>{booking.pickup.label}</Text>
          </View>
          {booking.dropoff ? (
            <View style={[styles.marker, styles.drop]}>
              <Text style={styles.markerLabel}>{booking.dropoff.label}</Text>
            </View>
          ) : null}
          <View style={styles.truckMarker}>
            <Ionicons name="car" size={28} color={colors.textDark} />
          </View>
          <View style={styles.etaBubble}>
            <Text style={styles.etaText}>{eta} min away</Text>
          </View>
        </View>

        <ScrollView style={styles.sheet}>
          <ScreenContent>
            <View style={styles.sheetHandle} />
            <Text style={styles.etaLarge}>{eta} min away</Text>
            <Text style={styles.liveBadge}>● Updating live</Text>

            {booking.driver ? (
              <Card style={styles.driverCard}>
                <View style={styles.driverRow}>
                  <View>
                    <Text style={styles.driverName}>{booking.driver.name}</Text>
                    <Text style={styles.driverMeta}>★ {booking.driver.rating} · Verified</Text>
                    <Text style={styles.driverExp}>{booking.driver.experience}</Text>
                  </View>
                  <PrimaryButton
                    label="Call"
                    onPress={() => Linking.openURL(`tel:${booking.driver!.phone}`)}
                  />
                </View>
              </Card>
            ) : null}

            <View style={styles.tripRow}>
              <Text style={styles.tripPoint}>{booking.pickup.label}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
              <Text style={styles.tripPoint}>{booking.dropoff?.label ?? 'On-site'}</Text>
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                label="Call Driver"
                onPress={() => booking.driver && Linking.openURL(`tel:${booking.driver.phone}`)}
                variant="outline"
              />
              <PrimaryButton
                label="View Details"
                onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                variant="outline"
              />
            </View>

            {booking.status === 'SERVICE_COMPLETED' || booking.status === 'PAID' ? (
              <PrimaryButton
                label="Rate Experience"
                onPress={() => navigation.navigate('RatingReview', {
                  bookingId: booking.id,
                  bookingType: booking.bookingType,
                })}
              />
            ) : null}
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  missing: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
  map: {
    height: '45%',
    backgroundColor: '#E8EEF2',
    position: 'relative',
    overflow: 'hidden',
  },
  mapOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 2,
  },
  mapTitle: { fontWeight: typography.weights.bold, fontSize: typography.sizes.lg, color: colors.textDark },
  mapSub: { color: colors.textMuted, fontSize: typography.sizes.sm },
  routeLine: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    transform: [{ rotate: '-8deg' }],
  },
  marker: {
    position: 'absolute',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  pickup: { top: '30%', left: '15%', backgroundColor: colors.success },
  drop: { top: '55%', right: '15%', backgroundColor: colors.accentRed },
  markerLabel: { color: colors.textLight, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  truckMarker: {
    position: 'absolute',
    top: '42%',
    left: '45%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaBubble: {
    position: 'absolute',
    top: '35%',
    left: '40%',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  etaText: { fontWeight: typography.weights.bold, color: colors.textDark, fontSize: typography.sizes.sm },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  etaLarge: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.textDark,
    textAlign: 'center',
  },
  liveBadge: { textAlign: 'center', color: colors.success, marginBottom: spacing.lg },
  driverCard: { marginBottom: spacing.md },
  driverRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textDark },
  driverMeta: { color: colors.primary, marginTop: spacing.xs },
  driverExp: { color: colors.textMuted, fontSize: typography.sizes.sm },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tripPoint: { fontWeight: typography.weights.semibold, color: colors.textDark },
  actions: { gap: spacing.md, marginBottom: spacing.md },
});
