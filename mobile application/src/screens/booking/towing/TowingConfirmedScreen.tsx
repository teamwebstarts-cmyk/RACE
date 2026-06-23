import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { TOWING_DRIVER, TOWING_TYPES } from '../../../constants/towingBooking';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingConfirmed'>;

export default function TowingConfirmedScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking } = useTowingBooking();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const towingImage =
    TOWING_TYPES.find(item => item.id === booking.towingType)?.image ?? TOWING_TYPES[0].image;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <TowingBookingLayout
      title="Booking Confirmed"
      step={6}
      onBack={() => navigation.goBack()}
      buttonLabel="View Booking"
      onContinue={() => navigation.navigate('TowingTrack')}
      secondaryLabel="Back to Home"
      onSecondary={() => navigation.popToTop()}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            width: t.px(88),
            height: t.px(88),
            borderRadius: t.px(44),
            backgroundColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: t.px(20),
            transform: [{ scale: scaleAnim }],
          }}>
          <Check size={t.px(42)} color={colors.background} strokeWidth={3} />
        </Animated.View>

        <Text
          style={{
            fontSize: t.px(20),
            fontWeight: typography.weights.bold,
            color: colors.success,
            marginBottom: t.px(10),
          }}>
          Your booking is confirmed!
        </Text>
        <Text
          style={{
            fontSize: t.labelBold,
            fontWeight: typography.weights.bold,
            color: colors.dark,
            marginBottom: t.px(8),
          }}>
          {booking.bookingId}
        </Text>
        <Text
          style={{
            fontSize: t.bodyLarge,
            fontWeight: typography.weights.semibold,
            color: colors.primary,
            marginBottom: t.px(24),
          }}>
          Estimated Arrival: {TOWING_DRIVER.arrivalMinutes} min
        </Text>

        <Image
          source={towingImage}
          style={{ width: t.px(240), height: t.px(130) }}
          resizeMode="contain"
        />
      </View>
    </TowingBookingLayout>
  );
}
