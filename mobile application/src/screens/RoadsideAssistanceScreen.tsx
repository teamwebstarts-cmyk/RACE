import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';
import { ArrowRight, MapPin, Phone, ShieldCheck, Zap } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ServiceDetailScreenLayout, {
  useServiceDetailMetrics,
} from '../components/services/ServiceDetailScreenLayout';
import { images } from '../assets';
import {
  ROADSIDE_ACCENT,
  ROADSIDE_ACCENT_LIGHT,
  ROADSIDE_SERVICES,
  ROADSIDE_VALUE_PROPS,
} from '../constants/roadsideBooking';
import { useRoadsideBooking } from '../context/RoadsideBookingContext';
import { brand } from '../theme/brand';
import type { HomeStackParamList } from '../types/navigation';
import type { RoadsideServiceId } from '../types/roadsideBooking';
import { colors, shadows, typography } from '../theme';

const VALUE_ICONS = {
  response: Zap,
  verified: ShieldCheck,
  location: MapPin,
} as const;

type Props = NativeStackScreenProps<HomeStackParamList, 'RoadsideAssistance'>;

export default function RoadsideAssistanceScreen({ navigation }: Props) {
  const { px } = useServiceDetailMetrics();
  const { updateBooking } = useRoadsideBooking();

  const bookService = (serviceId: RoadsideServiceId) => {
    updateBooking({ serviceId });
    navigation.navigate('RoadsideLocation');
  };

  return (
    <ServiceDetailScreenLayout>
      <View
        style={[
          {
            borderRadius: px(18),
            overflow: 'hidden',
            marginBottom: px(16),
            height: px(168),
          },
          shadows.card,
        ]}>
        <Image
          source={images.roadsideHeroBanner}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      <View style={{ gap: px(12), marginBottom: px(18) }}>
        {ROADSIDE_SERVICES.map(service => (
          <Pressable
            key={service.id}
            onPress={() => bookService(service.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: px(10),
              borderRadius: px(16),
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              padding: px(14),
            }}>
            <View
              style={{
                width: px(52),
                height: px(52),
                borderRadius: px(26),
                backgroundColor: ROADSIDE_ACCENT_LIGHT,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              <Image
                source={service.image}
                style={{ width: px(34), height: px(34) }}
                resizeMode="contain"
              />
            </View>

            <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: px(15),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  marginBottom: px(3),
                }}>
                {service.label}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: px(12),
                  color: colors.grey,
                  marginBottom: px(6),
                }}>
                {service.description}
              </Text>
              <Text
                style={{
                  fontSize: px(13),
                  fontWeight: typography.weights.bold,
                  color: ROADSIDE_ACCENT,
                }}>
                From ₹{service.price}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(2),
                flexShrink: 0,
              }}>
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.bold,
                  color: ROADSIDE_ACCENT,
                }}>
                Book Now
              </Text>
              <ArrowRight size={px(14)} color={ROADSIDE_ACCENT} strokeWidth={2.5} />
            </View>
          </Pressable>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: colors.lightGrey,
          borderRadius: px(14),
          paddingVertical: px(16),
          paddingHorizontal: px(8),
          marginBottom: px(16),
        }}>
        {ROADSIDE_VALUE_PROPS.map(item => {
          const Icon = VALUE_ICONS[item.id];
          return (
            <View key={item.id} style={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
              <Icon size={px(20)} color={ROADSIDE_ACCENT} strokeWidth={2} />
              <Text
                style={{
                  marginTop: px(6),
                  fontSize: px(11),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                  textAlign: 'center',
                }}>
                {item.highlight}
              </Text>
              <Text
                style={{
                  marginTop: px(2),
                  fontSize: px(9),
                  color: colors.grey,
                  textAlign: 'center',
                  lineHeight: px(12),
                }}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={() => void Linking.openURL(`tel:${brand.phoneRaw}`)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: px(8),
          borderRadius: px(14),
          backgroundColor: colors.error,
          paddingVertical: px(16),
        }}>
        <Phone size={px(20)} color={colors.background} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: px(16),
            fontWeight: typography.weights.bold,
            color: colors.background,
          }}>
          Emergency Call
        </Text>
      </Pressable>
    </ServiceDetailScreenLayout>
  );
}
