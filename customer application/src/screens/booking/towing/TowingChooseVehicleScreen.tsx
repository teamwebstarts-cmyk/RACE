import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { TOWING_VEHICLE_TYPES } from '../../../constants/towingBooking';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import type { TowingVehicleTypeId } from '../../../types/towingBooking';
import { colors, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingChooseVehicle'>;

function VehicleCard({
  label,
  image,
  isSelected,
  onPress,
  t,
}: {
  label: string;
  image: number;
  isSelected: boolean;
  onPress: () => void;
  t: ReturnType<typeof useBookingTheme>['t'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: t.cardRadius,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? colors.primary : colors.border,
        backgroundColor: colors.background,
        overflow: 'hidden',
      }}>
      {isSelected ? (
        <View
          style={{
            position: 'absolute',
            top: t.px(10),
            right: t.px(10),
            zIndex: 2,
            width: t.checkSize,
            height: t.checkSize,
            borderRadius: t.checkSize / 2,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Check size={t.px(13)} color={colors.background} strokeWidth={3} />
        </View>
      ) : null}

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.px(8) }}>
        <Image source={image} style={{ width: '88%', height: '78%' }} resizeMode="contain" />
      </View>

      <Text
        style={{
          textAlign: 'center',
          paddingBottom: t.px(12),
          fontSize: t.labelBold,
          fontWeight: typography.weights.bold,
          color: isSelected ? colors.primary : colors.dark,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function TowingChooseVehicleScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useTowingBooking();
  const [selected, setSelected] = useState<TowingVehicleTypeId>(booking.vehicleType);

  const rows = [
    TOWING_VEHICLE_TYPES.slice(0, 2),
    TOWING_VEHICLE_TYPES.slice(2, 4),
  ];

  return (
    <TowingBookingLayout
      title="Choose Vehicle Type"
      step={1}
      onBack={() => navigation.goBack()}
      onContinue={() => {
        updateBooking({ vehicleType: selected });
        navigation.navigate('TowingPickupDrop');
      }}>
      <View style={{ flex: 1, gap: t.gridGap }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flex: 1, flexDirection: 'row', gap: t.gridGap }}>
            {row.map(type => (
              <VehicleCard
                key={type.id}
                label={type.label}
                image={type.image}
                isSelected={selected === type.id}
                onPress={() => setSelected(type.id)}
                t={t}
              />
            ))}
          </View>
        ))}
      </View>
    </TowingBookingLayout>
  );
}
