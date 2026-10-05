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
  BatteryCharging,
  CheckCircle2,
  Disc,
  Fuel,
  Phone,
  Wrench,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { images } from '../assets';
import { useCatalogStore } from '../store/catalogStore';
import { brand } from '../theme/brand';
import type { HomeStackParamList } from '../types/navigation';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<HomeStackParamList, 'RoadsideAssistance'>;

const ROADSIDE_OPTIONS = [
  {
    id: 'flat_tyre',
    title: 'Flat Tyre Assistance',
    price: 'From ₹199',
    Icon: Disc,
  },
  {
    id: 'battery_jumpstart',
    title: 'Battery Jumpstart',
    price: 'From ₹199',
    Icon: BatteryCharging,
  },
  {
    id: 'fuel_delivery',
    title: 'Fuel Delivery',
    price: 'From ₹299',
    Icon: Fuel,
  },
  {
    id: 'minor_repair',
    title: 'Minor Mechanical Fix',
    price: 'From ₹399',
    Icon: Wrench,
  },
];

const WHY_CHOOSE_ITEMS = [
  { id: 'onspot', label: 'On-spot service' },
  { id: 'pricing', label: 'Fair & upfront pricing' },
  { id: 'skilled', label: 'Skilled technicians' },
  { id: 'availability', label: '24/7 availability' },
];

export default function RoadsideAssistanceScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);
  const insets = useSafeAreaInsets();

  const apiBrand = useCatalogStore(state => state.brand);

  const bookRoadside = (serviceId?: string) => {
    navigation.navigate('RoadsideSelectService');
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
          Roadside Assistance
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: px(20),
          paddingBottom: px(100),
          gap: px(14),
        }}
        showsVerticalScrollIndicator={false}>
        {/* Hero Banner Card */}
        <View
          style={[
            shadows.card,
            {
              borderRadius: px(18),
              overflow: 'hidden',
              height: px(165),
              position: 'relative',
              backgroundColor: '#1E2530',
            },
          ]}>
          <Image
            source={images.roadsideHeroBanner}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          {/* Overlay */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.36)',
                padding: px(16),
                justifyContent: 'space-between',
              },
            ]}>
            <View>
              <Text
                style={{
                  fontSize: px(22),
                  fontWeight: typography.weights.extrabold,
                  color: '#FFFFFF',
                  marginBottom: px(4),
                }}>
                Roadside{'\n'}Assistance
              </Text>
              <Text
                style={{
                  fontSize: px(13),
                  color: '#F0F0F0',
                  lineHeight: px(18),
                }}>
                Quick on-spot help,{'\n'}wherever you are.
              </Text>
            </View>

            {/* Available Now - 25 min Badge */}
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
                Available Now - 25 min
              </Text>
            </View>
          </View>
        </View>

        {/* Roadside Options List */}
        <View style={{ gap: px(10) }}>
          {ROADSIDE_OPTIONS.map(opt => (
            <View
              key={opt.id}
              style={[
                shadows.card,
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
                <opt.Icon size={px(20)} color={colors.primary} strokeWidth={2.2} />
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
                onPress={() => bookRoadside(opt.id)}
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
            shadows.card,
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
          onPress={() => bookRoadside()}
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
            Book Service
          </Text>
          <ArrowRight size={px(16)} color={colors.dark} strokeWidth={2.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
