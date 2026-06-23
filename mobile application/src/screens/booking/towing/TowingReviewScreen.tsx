import React from 'react';
import { Text, View } from 'react-native';
import { CalendarClock, Car, MapPin, Truck, Wrench } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import {
  TOWING_BOOKING_PRICE,
  getDateLabel,
  getShortLocation,
  getTimeLabel,
  getTowingTypeLabel,
  getVehicleLabel,
} from '../../../constants/towingBooking';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingReview'>;

export default function TowingReviewScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking } = useTowingBooking();

  const rows = [
    { Icon: Wrench, label: 'Service Type', value: 'Towing' },
    { Icon: Car, label: 'Vehicle', value: getVehicleLabel(booking.vehicleType) },
    { Icon: MapPin, label: 'Pickup', value: getShortLocation(booking.pickup) },
    { Icon: MapPin, label: 'Drop', value: getShortLocation(booking.drop) },
    { Icon: Truck, label: 'Towing Type', value: getTowingTypeLabel(booking.towingType) },
    {
      Icon: CalendarClock,
      label: 'Date & Time',
      value: `${getDateLabel(booking.dateId)}, ${getTimeLabel(booking.timeId)}`,
    },
  ];

  return (
    <TowingBookingLayout
      title="Review & Confirm"
      step={5}
      onBack={() => navigation.goBack()}
      buttonLabel="Confirm Booking"
      onContinue={() =>
        navigation.navigate('BookingPayment', { amount: TOWING_BOOKING_PRICE, flow: 'towing' })
      }
      footerNoteBelow={
        <Text
          style={{
            fontSize: t.caption,
            color: colors.grey,
            textAlign: 'center',
            marginTop: t.px(2),
            marginBottom: t.px(4),
          }}>
          You won't be charged until service completes
        </Text>
      }>
      <View
        style={[
          {
            flex: 1,
            borderRadius: t.cardRadius,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            paddingHorizontal: t.cardPadding,
            paddingTop: t.px(10),
            paddingBottom: t.px(18),
            justifyContent: 'space-between',
          },
          shadows.card,
        ]}>
        <View style={{ flex: 1, justifyContent: 'space-around' }}>
          {rows.map(row => (
            <View
              key={row.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: t.px(6),
              }}>
              <row.Icon size={t.iconSm} color={colors.dark} strokeWidth={2} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: t.px(12),
                  fontSize: t.bodyLarge,
                  fontWeight: typography.weights.semibold,
                  color: colors.dark,
                }}>
                {row.label}
              </Text>
              <Text
                style={{
                  fontSize: t.bodyLarge,
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  textAlign: 'right',
                }}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: t.px(16),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: t.labelBold,
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            Total
          </Text>
          <Text
            style={{
              fontSize: t.px(32),
              fontWeight: typography.weights.extrabold,
              color: colors.primary,
            }}>
            ₹{TOWING_BOOKING_PRICE}
          </Text>
        </View>
      </View>
    </TowingBookingLayout>
  );
}
