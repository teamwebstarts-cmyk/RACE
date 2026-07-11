import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { DriverFareBreakdownCard } from '../../../components/booking/FareBreakdownCard';
import { DRIVER_ACCENT } from '../../../constants/driverBooking';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverBookingConfirmed'>;

export default function DriverBookingConfirmedScreen({ navigation, route }: Props) {
  const { t } = useBookingTheme();
  const { bookingId, apiBookingId, service, eta, fareBreakdown } = route.params;

  return (
    <TowingBookingLayout
      title="Booking Confirmed! 🎉"
      step={6}
      showStep={false}
      accentColor={DRIVER_ACCENT}
      buttonLabel="Track Driver"
      onContinue={() =>
        navigation.navigate('DriverAssigned', {
          bookingId: apiBookingId,
          bookingType: 'driver',
        })
      }
      secondaryLabel="Go Home"
      onSecondary={() => navigation.popToTop()}
      hideFooter={false}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: '100%',
            borderRadius: t.cardRadius,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            padding: t.px(20),
            gap: t.px(14),
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: t.body, color: colors.grey }}>Booking ID</Text>
            <Text
              style={{
                fontSize: t.labelBold,
                fontWeight: typography.weights.bold,
                color: colors.dark,
              }}>
              {bookingId}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: t.body, color: colors.grey }}>Service</Text>
            <Text
              style={{
                fontSize: t.labelBold,
                fontWeight: typography.weights.bold,
                color: colors.dark,
                textAlign: 'right',
                flexShrink: 1,
                maxWidth: '55%',
              }}>
              {service}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: t.body, color: colors.grey }}>ETA</Text>
            <Text
              style={{
                fontSize: t.labelBold,
                fontWeight: typography.weights.bold,
                color: DRIVER_ACCENT,
                textAlign: 'right',
                flexShrink: 1,
                maxWidth: '55%',
              }}>
              {eta}
            </Text>
          </View>
          {fareBreakdown ? (
            <View style={{ marginTop: t.px(8) }}>
              <DriverFareBreakdownCard breakdown={fareBreakdown} accentColor={DRIVER_ACCENT} compact />
            </View>
          ) : null}
        </View>
      </View>
    </TowingBookingLayout>
  );
}
