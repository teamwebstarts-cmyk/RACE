import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { TOWING_TYPES } from '../../../constants/towingBooking';
import { useTowingBooking } from '../../../context/TowingBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import type { TowingTypeId } from '../../../types/towingBooking';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingSelectType'>;

export default function TowingSelectTypeScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useTowingBooking();
  const [selected, setSelected] = useState<TowingTypeId>(booking.towingType);

  return (
    <TowingBookingLayout
      title="Select Towing Type"
      step={3}
      onBack={() => navigation.goBack()}
      onContinue={() => {
        updateBooking({ towingType: selected });
        navigation.navigate('TowingDateTime');
      }}>
      <View style={{ flex: 1, gap: t.gridGap }}>
        {TOWING_TYPES.map(type => {
          const isSelected = selected === type.id;
          return (
            <Pressable
              key={type.id}
              onPress={() => setSelected(type.id)}
              style={[
                {
                  flex: 1,
                  borderRadius: t.cardRadius,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: colors.background,
                  overflow: 'hidden',
                },
                shadows.card,
              ]}>
              <View
                style={{
                  position: 'absolute',
                  top: t.px(12),
                  right: t.px(12),
                  zIndex: 2,
                  width: t.checkSize,
                  height: t.checkSize,
                  borderRadius: t.checkSize / 2,
                  borderWidth: isSelected ? 0 : 1.5,
                  borderColor: colors.border,
                  backgroundColor: isSelected ? colors.primary : colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {isSelected ? (
                  <Check size={t.px(13)} color={colors.background} strokeWidth={3} />
                ) : null}
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: t.px(10),
                  paddingTop: t.px(8),
                  paddingBottom: t.px(4),
                }}>
                <Image
                  source={type.image}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ paddingHorizontal: t.px(16), paddingBottom: t.px(14), paddingTop: t.px(2) }}>
                <Text
                  style={{
                    fontSize: t.labelBold,
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                    marginBottom: t.px(4),
                  }}>
                  {type.label}
                </Text>
                {type.descriptionLines ? (
                  type.descriptionLines.map(line => (
                    <Text
                      key={line}
                      style={{
                        fontSize: t.body,
                        color: colors.grey,
                        lineHeight: t.px(20),
                      }}>
                      {line}
                    </Text>
                  ))
                ) : (
                  <Text style={{ fontSize: t.body, color: colors.grey, lineHeight: t.px(20) }}>
                    {type.description}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </TowingBookingLayout>
  );
}
