import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Headphones, Phone, SlidersHorizontal } from 'lucide-react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ActiveBookingCard from '../components/bookings/ActiveBookingCard';
import BookingHistoryRow from '../components/bookings/BookingHistoryRow';
import {
  BOOKING_TABS,
  COMPLETED_BOOKINGS,
  ONGOING_BOOKINGS,
  type BookingTabId,
} from '../constants/bookingsScreen';
import { USER } from '../constants/demo';
import { brand } from '../theme/brand';
import type { BookingsStackParamList, RootTabParamList } from '../types/navigation';
import { colors, typography } from '../theme';

const REF_W = 390;

type BookingsNav = CompositeNavigationProp<
  NativeStackNavigationProp<BookingsStackParamList, 'BookingsMain'>,
  BottomTabNavigationProp<RootTabParamList>
>;

export default function BookingsScreen() {
  const navigation = useNavigation<BookingsNav>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);
  const [activeTab, setActiveTab] = useState<BookingTabId>('all');

  const showOngoing = activeTab === 'all' || activeTab === 'ongoing';
  const showHistory = activeTab === 'all' || activeTab === 'completed';
  const ongoingList =
    activeTab === 'ongoing' ? ONGOING_BOOKINGS : [ONGOING_BOOKINGS[0]];
  const historyList = COMPLETED_BOOKINGS;

  const openTrack = () => {
    navigation.navigate('TowingTrack', { fromBookings: true });
  };

  const openDetail = (bookingId: string) => {
    navigation.navigate('BookingDetail', { bookingId });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: px(16) + insets.bottom,
          }}>
          <View style={{ marginHorizontal: px(20) }}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: px(28),
                    fontWeight: typography.weights.extrabold,
                    color: colors.dark,
                  }}>
                  Bookings
                </Text>
                <Text
                  style={{
                    marginTop: px(4),
                    fontSize: px(13),
                    color: colors.grey,
                    lineHeight: px(18),
                  }}>
                  Track and manage your service requests
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(12) }}>
                <Pressable hitSlop={8} style={styles.bellWrap}>
                  <Bell size={px(22)} color={colors.dark} strokeWidth={2} />
                  <View style={styles.bellDot} />
                </Pressable>
                <View
                  style={[
                    styles.avatar,
                    { width: px(40), height: px(40), borderRadius: px(20) },
                  ]}>
                  <Text
                    style={{
                      fontSize: px(15),
                      fontWeight: typography.weights.bold,
                      color: colors.dark,
                    }}>
                    {USER.name.charAt(0)}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.lightGrey,
                borderRadius: px(12),
                padding: px(4),
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
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: px(10),
                      borderRadius: px(10),
                      backgroundColor: isActive ? colors.primary : 'transparent',
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
                {ongoingList.map(booking => (
                  <ActiveBookingCard
                    key={booking.id}
                    booking={booking}
                    px={px}
                    onTrack={openTrack}
                    onPress={() => openDetail(booking.id)}
                  />
                ))}
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

                {historyList.map(item => (
                  <BookingHistoryRow
                    key={item.id}
                    item={item}
                    px={px}
                    onPress={() => openDetail(item.id)}
                  />
                ))}
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
                <Text style={{ fontSize: px(12), color: colors.grey }}>
                  Support team available 24/7.
                </Text>
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bellWrap: {
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  avatar: {
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
