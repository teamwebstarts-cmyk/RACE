import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { TOWING_DATE_OPTIONS, TOWING_TIME_OPTIONS } from '../../../constants/towingBooking';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import type { TowingTimeId } from '../../../types/towingBooking';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingDateTime'>;

export default function TowingDateTimeScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useTowingBooking();
  const [dateId, setDateId] = useState(booking.dateId);
  const [timeId, setTimeId] = useState<TowingTimeId>(booking.timeId);

  return (
    <TowingBookingLayout
      title="Select Date & Time"
      step={4}
      onBack={() => navigation.goBack()}
      onContinue={() => {
        updateBooking({ dateId, timeId });
        navigation.navigate('TowingReview');
      }}>
      <View>
        <Text
          style={{
            fontSize: t.sectionTitle,
            fontWeight: typography.weights.bold,
            color: colors.dark,
            marginBottom: t.px(10),
          }}>
          Select Date
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: t.px(10),
            paddingRight: t.px(4),
            paddingBottom: t.px(4),
          }}>
          {TOWING_DATE_OPTIONS.map(date => {
            const selected = dateId === date.id;
            const showTodayStyle = date.isToday && selected;
            return (
              <Pressable
                key={date.id}
                onPress={() => setDateId(date.id)}
                style={{
                  width: t.px(82),
                  height: t.px(88),
                  borderRadius: t.inputRadius,
                  borderWidth: selected ? 0 : 1,
                  borderColor: colors.border,
                  backgroundColor: selected ? colors.primary : colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: t.px(4),
                }}>
                {showTodayStyle ? (
                  <>
                    <Calendar size={t.iconSm} color={colors.background} strokeWidth={2} />
                    <Text
                      style={{
                        fontSize: t.label,
                        fontWeight: typography.weights.bold,
                        color: colors.background,
                      }}>
                      Today
                    </Text>
                  </>
                ) : date.isToday ? (
                  <>
                    <Calendar size={t.px(18)} color={colors.dark} strokeWidth={2} />
                    <Text
                      style={{
                        fontSize: t.label,
                        fontWeight: typography.weights.bold,
                        color: colors.dark,
                      }}>
                      Today
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: t.labelBold,
                        fontWeight: typography.weights.bold,
                        color: colors.dark,
                      }}>
                      {date.day}
                    </Text>
                    <Text style={{ fontSize: t.caption, color: colors.grey }}>{date.date}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Text
          style={{
            fontSize: t.sectionTitle,
            fontWeight: typography.weights.bold,
            color: colors.dark,
            marginTop: t.px(20),
            marginBottom: t.px(10),
          }}>
          Select Time
        </Text>
        <View style={{ gap: t.px(10) }}>
          {TOWING_TIME_OPTIONS.map(option => {
            const selected = timeId === option.id;
            const Icon = option.Icon;
            return (
              <Pressable
                key={option.id}
                onPress={() => setTimeId(option.id)}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: t.px(12),
                    borderRadius: t.inputRadius,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.goldLight : colors.background,
                    paddingHorizontal: t.px(16),
                    paddingVertical: t.px(16),
                    minHeight: t.px(54),
                  },
                  shadows.card,
                ]}>
                <Icon
                  size={t.iconSm}
                  color={selected ? colors.primary : colors.dark}
                  strokeWidth={2}
                />
                <Text
                  style={{
                    fontSize: t.labelBold,
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                  }}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </TowingBookingLayout>
  );
}
