import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  CheckCircle2,
  Moon,
  Phone,
  User,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getServiceCategoryCard } from '../constants/serviceCategoryCards';
import { useDriverBooking } from '../context/DriverBookingContext';
import { useCatalogStore } from '../store/catalogStore';
import { brand } from '../theme/brand';
import type { HomeStackParamList } from '../types/navigation';
import type { DriverTypeId } from '../types/driverBooking';
import { colors, shadows, typography } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const REF_W = 390;

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverService'>;

const DRIVER_OPTIONS = [
  {
    id: 'part_time' as DriverTypeId,
    title: 'Part-Time Driver',
    price: 'From ₹199 / hr',
    Icon: User,
  },
  {
    id: 'full_time' as DriverTypeId,
    title: 'Full-Time Driver',
    price: 'From ₹999 / day',
    Icon: Calendar,
  },
  {
    id: 'outstation' as DriverTypeId,
    title: 'Outstation Driver',
    price: 'From ₹1,499 / trip',
    Icon: Car,
  },
  {
    id: 'night' as DriverTypeId,
    title: 'Night Driver',
    price: 'From ₹299 / night',
    Icon: Moon,
  },
];

const WHY_CHOOSE_ITEMS = [
  { id: 'police', label: 'Police verified' },
  { id: 'gps', label: 'GPS tracking' },
  { id: 'trained', label: 'Trained & experienced' },
  { id: 'packages', label: 'Flexible packages' },
];

export default function DriverServiceScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);
  const insets = useSafeAreaInsets();
  const heroCard = getServiceCategoryCard('driver');

  const { updateBooking, resetBooking } = useDriverBooking();
  const apiBrand = useCatalogStore(state => state.brand);

  const handleBook = (driverType: DriverTypeId) => {
    resetBooking();
    updateBooking({ driverType });

    if (driverType === 'full_time') {
      navigation.navigate('DriverEnquiry');
      return;
    }

    navigation.navigate('DriverDateTime');
  };

  const callSupport = () => {
    const phone = apiBrand?.phoneRaw ?? brand.phoneRaw;
    void Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.pageBg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: px(20),
          paddingTop: px(8),
          paddingBottom: px(14),
          position: 'relative',
        }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: px(20),
            width: px(36),
            height: px(36),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ArrowLeft size={px(22)} color={colors.dark} strokeWidth={2.4} />
        </Pressable>
        <Text
          style={{
            fontSize: px(18),
            fontWeight: typography.weights.extrabold,
            color: colors.dark,
          }}>
          Driver Service
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: px(20),
          paddingBottom: px(100),
          gap: px(14),
        }}
        showsVerticalScrollIndicator={false}>
        {/* Hero Card — same card as the Services page */}
        <View
          style={[
            shadows.cardSoft,
            {
              borderRadius: px(22),
              overflow: 'hidden',
              height: px(158),
              backgroundColor: '#FFFFFF',
            },
          ]}>
          <Image
            source={heroCard.image}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <LinearGradient
            colors={heroCard.gradientColors}
            locations={heroCard.gradientLocations}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={{
              flex: 1,
              paddingHorizontal: px(18),
              paddingVertical: px(16),
              justifyContent: 'space-between',
              maxWidth: '72%',
            }}>
            <View>
              <Text
                style={{
                  fontSize: px(20),
                  fontWeight: typography.weights.extrabold,
                  color: '#111827',
                  marginBottom: px(4),
                  letterSpacing: -0.3,
                }}>
                {heroCard.title}
              </Text>
              <Text
                style={{
                  fontSize: px(13),
                  color: heroCard.subtitleColor,
                  fontWeight: '600',
                  lineHeight: px(18),
                }}>
                {heroCard.subtitle}
              </Text>
            </View>

            {/* Drivers Available Pill */}
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                paddingHorizontal: px(10),
                paddingVertical: px(4),
                borderRadius: px(12),
                gap: px(6),
              }}>
              <View
                style={{
                  width: px(7),
                  height: px(7),
                  borderRadius: px(4),
                  backgroundColor: '#10B981',
                }}
              />
              <Text
                style={{
                  fontSize: px(11),
                  fontWeight: typography.weights.bold,
                  color: '#065F46',
                }}>
                Drivers Available
              </Text>
            </View>
          </View>
        </View>

        {/* Driver Options List */}
        <View style={{ gap: px(10) }}>
          {DRIVER_OPTIONS.map(opt => (
            <View
              key={opt.id}
              style={[
                shadows.cardSoft,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background,
                  borderRadius: px(16),
                  padding: px(14),
                  borderWidth: 1,
                  borderColor: '#F0EFEA',
                  gap: px(12),
                },
              ]}>
              <View
                style={{
                  width: px(44),
                  height: px(44),
                  borderRadius: px(22),
                  backgroundColor: colors.goldLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <opt.Icon size={px(20)} color={colors.primary} strokeWidth={2.6} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: px(14),
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                  }}>
                  {opt.title}
                </Text>
                <Text
                  style={{
                    fontSize: px(12),
                    fontWeight: typography.weights.bold,
                    color: colors.primary,
                    marginTop: px(3),
                  }}>
                  {opt.price}
                </Text>
              </View>

              <Pressable
                onPress={() => handleBook(opt.id)}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: px(14),
                  height: px(32),
                  borderRadius: px(8),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: px(12),
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                  }}>
                  Book Now
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Why Choose Us? Section */}
        <View
          style={[
            shadows.cardSoft,
            {
              backgroundColor: colors.background,
              borderRadius: px(16),
              padding: px(16),
              borderWidth: 1,
              borderColor: '#F0EFEA',
            },
          ]}>
          <Text
            style={{
              fontSize: px(15),
              fontWeight: typography.weights.extrabold,
              color: colors.dark,
              marginBottom: px(12),
            }}>
            Why Choose Us?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              rowGap: px(10),
              justifyContent: 'space-between',
            }}>
            {WHY_CHOOSE_ITEMS.map(item => (
              <View
                key={item.id}
                style={{
                  width: '48%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: px(6),
                }}>
                <CheckCircle2 size={px(16)} color={colors.primary} strokeWidth={2.4} />
                <Text
                  style={{
                    fontSize: px(12),
                    color: colors.dark,
                    fontWeight: typography.weights.semibold,
                  }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: px(20),
          paddingTop: px(10),
          paddingBottom: Math.max(insets.bottom, px(12)),
          flexDirection: 'row',
          gap: px(12),
        }}>
        <Pressable
          onPress={callSupport}
          style={{
            flex: 1,
            height: px(46),
            borderRadius: px(14),
            borderWidth: 1.5,
            borderColor: colors.primary,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: px(6),
          }}>
          <Phone size={px(16)} color={colors.primary} strokeWidth={2.4} />
          <Text
            style={{
              fontSize: px(14),
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            Call Now
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleBook('part_time')}
          style={{
            flex: 1.5,
            height: px(46),
            borderRadius: px(14),
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: px(8),
          }}>
          <Text
            style={{
              fontSize: px(14),
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            Book Driver
          </Text>
          <ArrowRight size={px(16)} color={colors.dark} strokeWidth={2.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
