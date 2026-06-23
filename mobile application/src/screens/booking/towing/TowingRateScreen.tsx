import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Camera, Star } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import DriverAvatar from '../../../components/bookings/DriverAvatar';
import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { TOWING_DRIVER } from '../../../constants/towingBooking';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingRate'>;

export default function TowingRateScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  return (
    <TowingBookingLayout
      title="Rate Your Experience"
      step={10}
      onBack={() => navigation.goBack()}
      buttonLabel="Submit Review"
      onContinue={() => navigation.popToTop()}
      scrollable>
      <View style={{ flex: 1 }}>
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.px(12),
              borderRadius: t.cardRadius,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.goldLight,
              padding: t.rowPadding,
              marginBottom: t.px(18),
            },
            shadows.card,
          ]}>
          <DriverAvatar size={t.px(48)} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: t.bodyLarge,
                fontWeight: typography.weights.bold,
                color: colors.dark,
              }}>
              {TOWING_DRIVER.name}
            </Text>
            <Text style={{ fontSize: t.caption, color: colors.grey, marginTop: t.px(2) }}>
              Your towing driver · {TOWING_DRIVER.rating} ★
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: t.bodyLarge,
            fontWeight: typography.weights.semibold,
            color: colors.dark,
            marginBottom: t.px(6),
            textAlign: 'center',
          }}>
          How was your towing experience?
        </Text>
        <Text
          style={{
            fontSize: t.caption,
            color: colors.grey,
            marginBottom: t.px(18),
            textAlign: 'center',
          }}>
          Your feedback helps us improve RACE Service
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: t.px(10),
            marginBottom: t.px(22),
            justifyContent: 'center',
          }}>
          {[1, 2, 3, 4, 5].map(star => (
            <Pressable key={star} onPress={() => setRating(star)} hitSlop={6}>
              <Star
                size={t.px(36)}
                color={colors.primary}
                fill={star <= rating ? colors.primary : 'transparent'}
                strokeWidth={2}
              />
            </Pressable>
          ))}
        </View>

        <View
          style={[
            {
              borderRadius: t.inputRadius,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              padding: t.rowPadding,
              minHeight: t.px(120),
              marginBottom: t.px(8),
            },
            shadows.card,
          ]}>
          <TextInput
            value={feedback}
            onChangeText={text => setFeedback(text.slice(0, 200))}
            placeholder="Write your feedback..."
            placeholderTextColor={colors.grey}
            multiline
            style={{
              fontSize: t.bodyLarge,
              color: colors.dark,
              lineHeight: t.px(22),
              textAlignVertical: 'top',
              minHeight: t.px(90),
            }}
          />
        </View>
        <Text
          style={{
            fontSize: t.caption,
            color: colors.grey,
            textAlign: 'right',
            marginBottom: t.px(20),
          }}>
          {feedback.length}/200
        </Text>

        <Text
          style={{
            fontSize: t.labelBold,
            fontWeight: typography.weights.bold,
            color: colors.dark,
            marginBottom: t.px(12),
          }}>
          Add Photos (Optional)
        </Text>
        <Pressable
          style={{
            height: t.px(100),
            borderRadius: t.inputRadius,
            borderWidth: 1.5,
            borderColor: colors.border,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.lightGrey,
          }}>
          <Camera size={t.px(28)} color={colors.grey} />
        </Pressable>
      </View>
    </TowingBookingLayout>
  );
}
