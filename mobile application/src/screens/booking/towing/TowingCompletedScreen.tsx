import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Check, Star } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingCompleted'>;

export default function TowingCompletedScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { resetBooking } = useTowingBooking();
  const scaleAnim = useRef(new Animated.Value(0)).current;

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
      title="Service Completed"
      step={9}
      onBack={() => navigation.goBack()}
      buttonLabel="Book Again"
      onContinue={() => {
        resetBooking();
        navigation.navigate('TowingChooseVehicle');
      }}
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
            fontSize: t.px(24),
            fontWeight: typography.weights.extrabold,
            color: colors.dark,
            marginBottom: t.px(8),
          }}>
          Service Completed!
        </Text>
        <Text
          style={{
            fontSize: t.bodyLarge,
            color: colors.grey,
            marginBottom: t.px(24),
            textAlign: 'center',
          }}>
          Thanks for choosing RACE Service.
        </Text>

        <Pressable onPress={() => navigation.navigate('TowingRate')} style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: t.px(8), marginBottom: t.px(12) }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={t.px(28)} color={colors.primary} fill={colors.primary} />
            ))}
          </View>
          <Text
            style={{
              fontSize: t.labelBold,
              fontStyle: 'italic',
              fontWeight: typography.weights.semibold,
              color: colors.primary,
            }}>
            Great Service! Tap to rate
          </Text>
        </Pressable>
      </View>
    </TowingBookingLayout>
  );
}
