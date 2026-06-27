import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BookingCard from '../../components/booking/BookingCard';
import EmptyState from '../../components/ui/EmptyState';
import Screen, { ScreenContent, SectionTitle } from '../../components/ui/Screen';
import { useBookingsQuery } from '../../services/bookings/useBookingQueries';
import type { Booking, BookingStatus } from '../../types/booking';
import type { BookingsStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingsMain'>;

type Tab = 'all' | 'ongoing' | 'completed';

const ONGOING: BookingStatus[] = ['CREATED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'SERVICE_STARTED'];
const COMPLETED: BookingStatus[] = ['SERVICE_COMPLETED', 'PAYMENT_PENDING', 'PAID'];

export default function BookingsScreen({ navigation }: Props) {
  const { data: bookings = [], isLoading } = useBookingsQuery();
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(() => {
    if (tab === 'ongoing') return bookings.filter((b) => ONGOING.includes(b.status));
    if (tab === 'completed') return bookings.filter((b) => COMPLETED.includes(b.status));
    return bookings;
  }, [bookings, tab]);

  const activeBooking = bookings.find((b) => ONGOING.includes(b.status));

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.title}>Bookings</Text>
            <Text style={styles.subtitle}>Track and manage your service requests</Text>

            <View style={styles.tabs}>
              {(['all', 'ongoing', 'completed'] as Tab[]).map((t) => (
                <Pressable
                  key={t}
                  style={[styles.tab, tab === t && styles.tabActive]}
                  onPress={() => setTab(t)}>
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                    {t === 'all' ? 'All' : t === 'ongoing' ? 'Ongoing' : 'Completed'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {activeBooking && tab !== 'completed' ? (
              <>
                <SectionTitle title="active" highlight="booking" />
                <BookingCard
                  booking={activeBooking}
                  onPress={() => navigation.navigate('LiveTracking', { bookingId: activeBooking.id })}
                />
              </>
            ) : null}

            <SectionTitle title="booking" highlight="history" />

            {isLoading ? (
              <Text style={styles.loading}>Loading bookings...</Text>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No bookings yet"
                subtitle="Book a towing, driver, or roadside service to get started."
                actionLabel="Browse Services"
                onAction={() => navigation.getParent()?.navigate('Home')}
              />
            ) : (
              filtered.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  compact
                  onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                />
              ))
            )}
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.extrabold, color: colors.textDark },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontWeight: typography.weights.semibold, color: colors.textMuted, fontSize: typography.sizes.sm },
  tabTextActive: { color: colors.textDark },
  loading: { color: colors.textMuted, textAlign: 'center', padding: spacing.xl },
});
