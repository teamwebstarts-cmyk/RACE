import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { MessageCircle, Phone, Star } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import MapPlaceholder from '../../../components/booking/MapPlaceholder';
import DriverAvatar from '../../../components/bookings/DriverAvatar';
import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { TOWING_DRIVER } from '../../../constants/towingBooking';
import { brand } from '../../../theme/brand';
import type { HomeStackParamList } from '../../../types/navigation';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'TowingDriverOnWay'>;

export default function TowingDriverOnWayScreen({ navigation }: Props) {
  const { t } = useBookingTheme();

  return (
    <TowingBookingLayout
      title="Your driver is on the way"
      step={8}
      headerVariant="inline"
      onBack={() => navigation.goBack()}
      buttonLabel="Continue"
      onContinue={() => navigation.navigate('TowingCompleted')}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, marginBottom: t.px(14) }}>
          <MapPlaceholder px={t.px} variant="driver" />
        </View>

        <View
          style={[
            {
              borderRadius: t.cardRadius,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              padding: t.cardPadding,
            },
            shadows.card,
          ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.px(12) }}>
            <DriverAvatar size={t.px(52)} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: t.labelBold,
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                }}>
                {TOWING_DRIVER.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.px(4) }}>
                <Star size={t.px(16)} color={colors.primary} fill={colors.primary} />
                <Text
                  style={{
                    fontSize: t.body,
                    fontWeight: typography.weights.semibold,
                    color: colors.grey,
                  }}>
                  {TOWING_DRIVER.rating}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              marginTop: t.px(16),
              fontSize: t.px(24),
              fontWeight: typography.weights.extrabold,
              color: colors.primary,
              textAlign: 'center',
            }}>
            Arriving in {TOWING_DRIVER.etaMinutes} min
          </Text>

          <View style={{ flexDirection: 'row', gap: t.px(10), marginTop: t.px(16) }}>
            <Pressable
              onPress={() => void Linking.openURL(`tel:${brand.phoneRaw}`)}
              style={{
                flex: 1,
                height: t.px(48),
                borderRadius: t.inputRadius,
                borderWidth: 1.5,
                borderColor: colors.primary,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.px(6),
              }}>
              <Phone size={t.px(18)} color={colors.primary} />
              <Text
                style={{
                  fontSize: t.body,
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                Call Driver
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                height: t.px(48),
                borderRadius: t.inputRadius,
                borderWidth: 1.5,
                borderColor: colors.primary,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.px(6),
              }}>
              <MessageCircle size={t.px(18)} color={colors.primary} />
              <Text
                style={{
                  fontSize: t.body,
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                Chat
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </TowingBookingLayout>
  );
}
