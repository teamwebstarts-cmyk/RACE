import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { formatBookingDate, getBookingServiceIcon } from '../../constants/bookingsScreen';
import type { BookingHistoryItem } from '../../types/models';
import { colors, typography } from '../../theme';

type Props = {
  item: BookingHistoryItem;
  px: (n: number) => number;
  onPress?: () => void;
};

export default function BookingHistoryRow({ item, px, onPress }: Props) {
  const ServiceIcon = getBookingServiceIcon(item.service);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: px(12),
        borderRadius: px(14),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        padding: px(14),
        marginBottom: px(10),
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
        <ServiceIcon size={px(20)} color={colors.primary} strokeWidth={2.5} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: px(14),
            fontWeight: typography.weights.bold,
            color: colors.dark,
            marginBottom: px(3),
          }}>
          {item.service}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: px(11),
            color: colors.grey,
            marginBottom: px(2),
          }}>
          {formatBookingDate(item.date)}
        </Text>
        <Text numberOfLines={1} style={{ fontSize: px(11), color: colors.grey }}>
          {item.location}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
        <View
          style={{
            paddingHorizontal: px(8),
            paddingVertical: px(3),
            borderRadius: px(10),
            backgroundColor: '#E8F8EE',
            marginBottom: px(6),
          }}>
          <Text
            style={{
              fontSize: px(10),
              fontWeight: typography.weights.bold,
              color: colors.success,
            }}>
            {item.status}
          </Text>
        </View>
        <Text
          style={{
            fontSize: px(14),
            fontWeight: typography.weights.bold,
            color: colors.dark,
            marginBottom: px(2),
          }}>
          ₹{item.amount}
        </Text>
        <ChevronRight size={px(16)} color={colors.grey} strokeWidth={2} />
      </View>
    </Pressable>
  );
}
