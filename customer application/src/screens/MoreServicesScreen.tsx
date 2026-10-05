import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Building2,
  Car,
  FileCheck2,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from '../assets';
import type { HomeStackParamList } from '../types/navigation';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<HomeStackParamList, 'MoreServices'>;

const UPCOMING_SERVICES = [
  {
    id: 'car_wash',
    title: 'Car Wash',
    description: 'Professional cleaning at your doorstep',
    Icon: Sparkles,
  },
  {
    id: 'inspection',
    title: 'Vehicle Inspection',
    description: 'Pre-purchase & health checks',
    Icon: FileCheck2,
  },
  {
    id: 'insurance',
    title: 'Insurance Assistance',
    description: 'Claims, renewals & support',
    Icon: ShieldAlert,
  },
  {
    id: 'ev_charging',
    title: 'EV Charging Support',
    description: 'Mobile charging for EVs',
    Icon: Zap,
  },
  {
    id: 'ambulance',
    title: 'Ambulance Service',
    description: 'Emergency medical transport',
    Icon: Activity,
  },
  {
    id: 'corporate_fleet',
    title: 'Corporate Fleet',
    description: 'Fleet management & bulk solutions',
    Icon: Building2,
  },
];

export default function MoreServicesScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

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
          More Services
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: px(20),
          paddingBottom: px(40),
          gap: px(12),
        }}
        showsVerticalScrollIndicator={false}>
        {/* Hero Banner Card */}
        <View
          style={[
            shadows.card,
            {
              borderRadius: px(20),
              backgroundColor: '#FEF7EC',
              borderWidth: 1,
              borderColor: '#FFE8BD',
              padding: px(16),
              height: px(132),
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          ]}>
          <View style={{ flex: 1, paddingRight: px(10) }}>
            <Text
              style={{
                fontSize: px(20),
                fontWeight: typography.weights.extrabold,
                color: colors.dark,
                marginBottom: px(4),
              }}>
              More Services
            </Text>
            <Text
              style={{
                fontSize: px(13),
                color: colors.grey,
                lineHeight: px(18),
              }}>
              Exciting new services{'\n'}coming soon!
            </Text>
          </View>

          <View style={{ position: 'relative', width: px(110), height: px(90), alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={images.moreServicesBanner}
              style={{ width: px(105), height: px(82) }}
              resizeMode="contain"
            />
            {/* Pill on car */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: colors.primary,
                paddingHorizontal: px(8),
                paddingVertical: px(3),
                borderRadius: px(8),
              }}>
              <Text
                style={{
                  fontSize: px(9),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                }}>
                Coming Soon
              </Text>
            </View>
          </View>
        </View>

        {/* Upcoming Services List */}
        {UPCOMING_SERVICES.map(item => (
          <View
            key={item.id}
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
              <item.Icon size={px(20)} color={colors.primary} strokeWidth={2.2} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: px(14),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                }}>
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: px(11),
                  color: colors.grey,
                  marginTop: px(2),
                }}>
                {item.description}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: '#F3F4F6',
                paddingHorizontal: px(10),
                paddingVertical: px(4),
                borderRadius: px(8),
              }}>
              <Text
                style={{
                  fontSize: px(11),
                  fontWeight: typography.weights.semibold,
                  color: '#6B7280',
                }}>
                Soon
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
