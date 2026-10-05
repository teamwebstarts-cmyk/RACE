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
  ArrowLeft,
  Building2,
  FileCheck2,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getServiceCategoryCard } from '../constants/serviceCategoryCards';
import type { HomeStackParamList } from '../types/navigation';
import { colors, shadows, typography } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

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
  const heroCard = getServiceCategoryCard('future');

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
            locations={[0, 0.4, 0.56, 0.74]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Vertical melt: dissolve the cropped top/bottom edges into the card surface */}
          <LinearGradient
            colors={['#FFFFFF', 'rgba(255,255,255,0)', 'rgba(255,255,255,0)', '#FFFFFF']}
            locations={[0, 0.13, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
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

            {/* Coming Soon Pill */}
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: colors.primary,
                paddingHorizontal: px(10),
                paddingVertical: px(4),
                borderRadius: px(12),
              }}>
              <Text
                style={{
                  fontSize: px(11),
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
              <item.Icon size={px(20)} color={colors.primary} strokeWidth={2.6} />
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
