import React from 'react';
import { Text, View } from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import {
  DRIVER_BOOKING_TOTAL,
  getDateReviewLabel,
  getDriverTypeLabel,
  getDurationReviewLabel,
} from '../../../constants/driverBooking';
import { useDriverBooking } from '../../../context/DriverBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverReview'>;

export default function DriverReviewScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking } = useDriverBooking();

  const rows = [
    { Icon: Clock, label: 'Driver Type', value: getDriverTypeLabel(booking.driverType) },
    { Icon: Calendar, label: 'Date', value: getDateReviewLabel(booking.dateId) },
    { Icon: Clock, label: 'Duration', value: getDurationReviewLabel(booking.durationId) },
    { Icon: MapPin, label: 'Pickup', value: booking.pickup },
  ];

  return (
    <TowingBookingLayout
      title="Review & Confirm"
      step={4}
      onBack={() => navigation.goBack()}
      buttonLabel="Confirm Booking"
      onContinue={() =>
        navigation.navigate('BookingPayment', { amount: DRIVER_BOOKING_TOTAL, flow: 'driver' })
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
          No charge until service starts
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
            paddingTop: t.px(6),
            paddingBottom: t.px(18),
            justifyContent: 'space-between',
          },
          shadows.card,
        ]}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {rows.map((row, index) => (
            <View
              key={row.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: t.px(14),
                borderBottomWidth: index < rows.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
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
                  flex: 1.1,
                  fontSize: t.bodyLarge,
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  textAlign: 'right',
                  lineHeight: t.px(22),
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
            ₹{DRIVER_BOOKING_TOTAL}
          </Text>
        </View>
      </View>
    </TowingBookingLayout>
  );
}
