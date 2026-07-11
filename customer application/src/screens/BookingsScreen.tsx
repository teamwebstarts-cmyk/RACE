import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Headphones, Phone, SlidersHorizontal } from 'lucide-react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ActiveBookingCard from '../components/bookings/ActiveBookingCard';
import BookingHistoryRow from '../components/bookings/BookingHistoryRow';
import AppScreenLayout from '../components/ui/AppScreenLayout';
import TabRootHeader from '../components/ui/TabRootHeader';
import { BOOKING_TABS, type BookingTabId } from '../constants/bookingsScreen';
import { useBookingsQuery } from '../services/bookings/useBookingQueries';
import { brand } from '../theme/brand';
import type { BookingsStackParamList, RootTabParamList } from '../types/navigation';
import {
  isBookingCompleted,
  isBookingOngoing,
  mapBookingToActiveCard,
  mapBookingToHistoryRow,
  resolveBookingType,
} from '../utils/bookingDisplay';
import { colors, typography } from '../theme';

const REF_W = 390;

type BookingsNav = CompositeNavigationProp<
  NativeStackNavigationProp<BookingsStackParamList, 'BookingsMain'>,
  BottomTabNavigationProp<RootTabParamList>
>;

export default function BookingsScreen() {
  const navigation = useNavigation<BookingsNav>();
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);
  const [activeTab, setActiveTab] = useState<BookingTabId>('all');
  const { data: bookings = [], isLoading, refetch, isRefetching } = useBookingsQuery();
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      void refetch().then((result) => {
        setLoadError(result.error ? 'Failed to load bookings. Pull to refresh.' : null);
      });
    }, [refetch]),
  );

  const typeFiltered = useMemo(() => {
    if (activeTab === 'towing') {
      return bookings.filter(b => (b.bookingType ?? 'towing') === 'towing');
    }
    if (activeTab === 'driver') {
      return bookings.filter(b => b.bookingType === 'driver');
    }
    return bookings;
  }, [activeTab, bookings]);

  const ongoingList = useMemo(
    () => typeFiltered.filter(isBookingOngoing).map(mapBookingToActiveCard),
    [typeFiltered],
  );

  const historyList = useMemo(
    () => typeFiltered.filter(isBookingCompleted).map(mapBookingToHistoryRow),
    [typeFiltered],
  );

  const showOngoing =
    activeTab === 'all' ||
    activeTab === 'ongoing' ||
    activeTab === 'towing' ||
    activeTab === 'driver';
  const showHistory =
    activeTab === 'all' ||
    activeTab === 'completed' ||
    activeTab === 'towing' ||
    activeTab === 'driver';

  const visibleOngoing =
    activeTab === 'ongoing' || activeTab === 'towing' || activeTab === 'driver'
      ? ongoingList
      : ongoingList.slice(0, 1);

  const openTrack = (bookingId: string, bookingType: 'towing' | 'driver') => {
    if (bookingType === 'driver') {
      navigation.navigate('DriverTrack', { bookingId, bookingType, fromBookings: true });
      return;
    }
    navigation.navigate('TowingTrack', { bookingId, bookingType, fromBookings: true });
  };

  const openDetail = (bookingId: string) => {
    navigation.navigate('BookingDetail', { bookingId });
  };

  return (
    <AppScreenLayout
      header={
        <TabRootHeader
          title="Bookings"
          subtitle="Track and manage your service requests"
        />
      }>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: px(8),
          marginTop: px(16),
          marginBottom: px(18),
        }}>
        {BOOKING_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: px(8),
                paddingHorizontal: px(12),
                borderRadius: px(20),
                borderWidth: 1,
                borderColor: isActive ? colors.primary : colors.border,
                backgroundColor: isActive ? colors.primary : colors.background,
              }}>
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.bold,
                  color: isActive ? colors.dark : colors.grey,
                }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading || isRefetching ? (
        <View style={{ alignItems: 'center', paddingVertical: px(24) }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
      {loadError ? (
        <View
          style={{
            borderRadius: px(12),
            borderWidth: 1,
            borderColor: colors.error,
            backgroundColor: '#FFEDED',
            padding: px(10),
            marginBottom: px(12),
          }}>
          <Text style={{ color: colors.error, fontSize: px(12), fontWeight: typography.weights.semibold }}>
            {loadError}
          </Text>
        </View>
      ) : null}

      {showOngoing ? (
        <View style={{ marginBottom: px(4) }}>
          <Text
            style={{
              fontSize: px(16),
              fontWeight: typography.weights.bold,
              color: colors.dark,
              marginBottom: px(8),
            }}>
            {activeTab === 'ongoing' ? 'Ongoing Bookings' : 'Active Booking'}
          </Text>
          {visibleOngoing.length === 0 ? (
            <Text style={{ fontSize: px(13), color: colors.grey, marginBottom: px(12) }}>
              No ongoing bookings right now.
            </Text>
          ) : (
            visibleOngoing.map((booking: ReturnType<typeof mapBookingToActiveCard>) => (
              <ActiveBookingCard
                key={booking.id}
                booking={booking}
                px={px}
                onTrack={() => openTrack(booking.id, booking.bookingType)}
                onPress={() => openDetail(booking.id)}
              />
            ))
          )}
        </View>
      ) : null}

      {showHistory ? (
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: px(10),
            }}>
            <Text
              style={{
                fontSize: px(16),
                fontWeight: typography.weights.bold,
                color: colors.dark,
              }}>
              Booking History
            </Text>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(4),
                paddingHorizontal: px(10),
                paddingVertical: px(6),
                borderRadius: px(10),
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              <SlidersHorizontal size={px(14)} color={colors.dark} strokeWidth={2} />
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.semibold,
                  color: colors.dark,
                }}>
                Filter
              </Text>
            </Pressable>
          </View>

          {historyList.length === 0 ? (
            <Text style={{ fontSize: px(13), color: colors.grey, marginBottom: px(12) }}>
              Completed bookings will appear here.
            </Text>
          ) : (
            historyList.map((item: ReturnType<typeof mapBookingToHistoryRow>) => (
              <BookingHistoryRow
                key={item.id}
                item={item}
                px={px}
                onPress={() => openDetail(item.id)}
              />
            ))
          )}
        </View>
      ) : null}

      <View
        style={{
          marginTop: px(8),
          borderRadius: px(14),
          borderWidth: 1.5,
          borderColor: colors.primary,
          backgroundColor: colors.background,
          padding: px(14),
          flexDirection: 'row',
          alignItems: 'center',
          gap: px(12),
        }}>
        <View
          style={{
            width: px(44),
            height: px(44),
            borderRadius: px(22),
            backgroundColor: colors.goldLight,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <Headphones size={px(20)} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: px(14),
              fontWeight: typography.weights.bold,
              color: colors.dark,
              marginBottom: px(2),
            }}>
            Need help with a booking?
          </Text>
          <Text style={{ fontSize: px(12), color: colors.grey }}>Support team available 24/7.</Text>
        </View>
        <Pressable
          onPress={() => void Linking.openURL(`tel:${brand.phoneRaw}`)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(4),
            paddingHorizontal: px(10),
            paddingVertical: px(8),
            borderRadius: px(10),
            borderWidth: 1.5,
            borderColor: colors.primary,
            flexShrink: 0,
          }}>
          <Phone size={px(14)} color={colors.primary} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: px(11),
              fontWeight: typography.weights.bold,
              color: colors.primary,
            }}>
            Call{'\n'}Support
          </Text>
        </Pressable>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({});
