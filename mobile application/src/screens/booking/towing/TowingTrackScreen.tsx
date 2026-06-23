import React from 'react';
import { Text, View } from 'react-native';
import { Clock, MapPin, Navigation, Radio } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import MapPlaceholder from '../../../components/booking/MapPlaceholder';
import DriverAvatar from '../../../components/bookings/DriverAvatar';
import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { TOWING_DRIVER } from '../../../constants/towingBooking';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingTrack'>;

const TRACK_STEPS = ['Confirmed', 'On the Way', 'Pickup', 'Drop-off'];

export default function TowingTrackScreen({ navigation, route }: Props) {
  const { t } = useBookingTheme();
  const { booking } = useTowingBooking();
  const fromBookings = route.params?.fromBookings;

  return (
    <TowingBookingLayout
      title="Live Tracking"
      step={7}
      headerVariant="inline"
      onBack={() => navigation.goBack()}
      buttonLabel={fromBookings ? 'Back to Bookings' : 'Continue'}
      onContinue={
        fromBookings
          ? () => navigation.goBack()
          : () => navigation.navigate('TowingDriverOnWay')
      }>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.px(8),
            marginBottom: t.px(10),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.px(5),
              paddingHorizontal: t.px(10),
              paddingVertical: t.px(4),
              borderRadius: t.px(20),
              backgroundColor: '#FEE2E2',
            }}>
            <Radio size={t.px(12)} color={colors.error} />
            <Text
              style={{
                fontSize: t.caption,
                fontWeight: typography.weights.bold,
                color: colors.error,
              }}>
              LIVE
            </Text>
          </View>
          <Text style={{ fontSize: t.caption, color: colors.grey }}>
            {booking.bookingId} · Towing Service
          </Text>
        </View>

        <View style={{ flex: 1, marginBottom: t.px(12) }}>
          <MapPlaceholder px={t.px} variant="route" />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: t.px(14),
            paddingHorizontal: t.px(4),
          }}>
          {TRACK_STEPS.map((step, index) => {
            const active = index <= 1;
            return (
              <View key={step} style={{ alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: t.px(10),
                    height: t.px(10),
                    borderRadius: t.px(5),
                    backgroundColor: active ? colors.primary : colors.border,
                    marginBottom: t.px(4),
                  }}
                />
                <Text
                  style={{
                    fontSize: t.px(9),
                    fontWeight: active ? typography.weights.bold : typography.weights.semibold,
                    color: active ? colors.dark : colors.grey,
                    textAlign: 'center',
                  }}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        <View
          style={[
            {
              borderRadius: t.cardRadius,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              padding: t.rowPadding,
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.px(10),
              marginBottom: t.px(10),
            },
            shadows.card,
          ]}>
          <Clock size={t.iconSm} color={colors.primary} />
          <Text
            style={{
              fontSize: t.bodyLarge,
              fontWeight: typography.weights.semibold,
              color: colors.dark,
            }}>
            ETA:{' '}
            <Text style={{ color: colors.primary }}>{TOWING_DRIVER.arrivalMinutes} min</Text>
          </Text>
          <Navigation size={t.iconSm} color={colors.grey} style={{ marginLeft: 'auto' }} />
        </View>

        <View
          style={[
            {
              borderRadius: t.cardRadius,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              padding: t.rowPadding,
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.px(12),
            },
            shadows.card,
          ]}>
          <DriverAvatar size={t.px(44)} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: t.bodyLarge,
                fontWeight: typography.weights.bold,
                color: colors.dark,
              }}>
              {TOWING_DRIVER.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.px(4) }}>
              <MapPin size={t.px(12)} color={colors.grey} />
              <Text style={{ fontSize: t.caption, color: colors.grey }}>
                Flatbed · {TOWING_DRIVER.rating} ★
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TowingBookingLayout>
  );
}
