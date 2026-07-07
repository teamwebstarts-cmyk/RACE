import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { TowingFareBreakdownCard } from '../../../components/booking/FareBreakdownCard';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingConfirmed'>;

const TOWING_ACCENT = '#F59E0B';

export default function TowingConfirmedScreen({ navigation, route }: Props) {
  const { t } = useBookingTheme();
  const { bookingId, apiBookingId, service, eta, fareBreakdown } = route.params;
  const trackParams = {
    bookingId: apiBookingId,
    bookingType: 'towing' as const,
  };

  return (
    <TowingBookingLayout
      title="Booking Confirmed! 🎉"
      step={6}
      showStep={false}
      accentColor={TOWING_ACCENT}
      onBack={() => navigation.popToTop()}
      buttonLabel="Track Booking"
      onContinue={() => navigation.navigate('TowingTrack', trackParams)}
      secondaryLabel="Go Home"
      onSecondary={() => navigation.popToTop()}
      secondaryVariant="outline">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.px(12) }}>
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
                color: TOWING_ACCENT,
              }}>
              {eta}
            </Text>
          </View>
          {fareBreakdown ? (
            <View style={{ marginTop: t.px(8) }}>
              <TowingFareBreakdownCard breakdown={fareBreakdown} accentColor={TOWING_ACCENT} compact />
            </View>
          ) : null}
        </View>
      </View>
    </TowingBookingLayout>
  );
}
