import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MapPin, Plus } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingPickupDrop'>;

function LocationField({
  label,
  value,
  pinColor,
  isPickup,
  t,
}: {
  label: string;
  value: string;
  pinColor: string;
  isPickup: boolean;
  t: ReturnType<typeof useBookingTheme>['t'];
}) {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.px(8),
          marginBottom: t.px(8),
        }}>
        <MapPin size={t.iconSm} color={pinColor} fill={pinColor} />
        <Text
          style={{
            fontSize: t.labelBold,
            fontWeight: typography.weights.bold,
            color: colors.dark,
          }}>
          {label}
        </Text>
      </View>
      <View
        style={{
          borderRadius: t.inputRadius,
          borderWidth: isPickup ? 1.5 : 1,
          borderColor: isPickup ? colors.primary : colors.border,
          backgroundColor: isPickup ? colors.goldLight : colors.background,
          paddingHorizontal: t.px(14),
          paddingVertical: t.px(14),
        }}>
        <Text
          style={{
            fontSize: t.bodyLarge,
            fontWeight: typography.weights.semibold,
            color: colors.dark,
            lineHeight: t.px(22),
          }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function TowingPickupDropScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useTowingBooking();
  const [pickup] = useState(booking.pickup);
  const [drop] = useState(booking.drop);

  return (
    <TowingBookingLayout
      title="Pickup & Drop Location"
      step={2}
      onBack={() => navigation.goBack()}
      onContinue={() => {
        updateBooking({ pickup, drop });
        navigation.navigate('TowingSelectType');
      }}>
      <View
        style={[
          {
            borderRadius: t.cardRadius,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            paddingHorizontal: t.px(18),
            paddingTop: t.px(18),
            paddingBottom: t.px(16),
          },
          shadows.card,
        ]}>
        <LocationField label="Pickup" value={pickup} pinColor={colors.primary} isPickup t={t} />

        <View style={{ height: t.px(18) }} />

        <LocationField label="Drop" value={drop} pinColor={colors.error} isPickup={false} t={t} />

        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.px(8),
            marginTop: t.px(16),
          }}>
          <Plus size={t.iconSm} color={colors.primary} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: t.labelBold,
              fontWeight: typography.weights.bold,
              color: colors.primary,
            }}>
            Add Via Point
          </Text>
        </Pressable>
      </View>
    </TowingBookingLayout>
  );
}
