import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import {
  DRIVER_ACCENT,
  DRIVER_LIGHT_BG,
  DRIVER_VEHICLE_TYPES,
  getDriverVehicleTypeLabel,
} from '../../../constants/driverBooking';
import { useDriverBooking } from '../../../context/DriverBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import type { DriverVehicleCategory } from '../../../types/fare';
import { colors, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverChooseVehicleType'>;

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
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.px(14),
        borderRadius: t.cardRadius,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? DRIVER_ACCENT : colors.border,
        backgroundColor: isSelected ? DRIVER_LIGHT_BG : colors.background,
        paddingHorizontal: t.px(16),
        paddingVertical: t.px(14),
      }}>
      <View
        style={{
          width: t.px(72),
          height: t.px(56),
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image source={image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      </View>

      <Text
        style={{
          flex: 1,
          fontSize: t.labelBold,
          fontWeight: typography.weights.bold,
          color: isSelected ? DRIVER_ACCENT : colors.dark,
        }}>
        {label}
      </Text>

      <View
        style={{
          width: t.checkSize,
          height: t.checkSize,
          borderRadius: t.checkSize / 2,
          borderWidth: isSelected ? 0 : 1.5,
          borderColor: colors.border,
          backgroundColor: isSelected ? DRIVER_ACCENT : colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {isSelected ? <Check size={t.px(13)} color={colors.background} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

export default function DriverChooseVehicleTypeScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useDriverBooking();
  const [selected, setSelected] = useState<DriverVehicleCategory | undefined>(
    booking.vehicleCategory,
  );

  return (
    <TowingBookingLayout
      title="Choose Vehicle Type"
      step={3}
      accentColor={DRIVER_ACCENT}
      onBack={() => navigation.goBack()}
      continueDisabled={!selected}
      onContinue={() => {
        if (!selected) return;
        updateBooking({
          vehicleCategory: selected,
          vehicleLabel: getDriverVehicleTypeLabel(selected),
        });
        navigation.navigate('DriverReview');
      }}>
      <Text
        style={{
          fontSize: t.bodyLarge,
          color: colors.grey,
          textAlign: 'center',
          marginBottom: t.px(16),
        }}>
        Select the type of car you need a driver for
      </Text>

      <View style={{ gap: t.px(12) }}>
        {DRIVER_VEHICLE_TYPES.map(type => (
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
    </TowingBookingLayout>
  );
}
