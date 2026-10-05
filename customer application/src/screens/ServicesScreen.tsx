import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from '../assets';
import { useCatalogStore } from '../store/catalogStore';
import type { ServicesStackParamList } from '../types/navigation';
import { openServiceCategory } from '../utils/serviceNavigation';
import { colors, shadows, typography } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const REF_W = 390;

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicesMain'>;

const SERVICE_CARDS = [
  {
    id: 'towing',
    title: 'Towing Service',
    categoryTitle: 'Towing Service',
    subtitle: 'Fast & safe towing\nanytime, anywhere.',
    subtitleColor: '#5C4813',
    cardBg: '#FED569',
    fogColors: [
      '#FED569',
      'rgba(254, 213, 105, 0.75)',
      'rgba(254, 213, 105, 0)',
    ] as const,
    image: images.serviceTowingCard,
  },
  {
    id: 'driver',
    title: 'Driver Service',
    categoryTitle: 'Driver Service',
    subtitle: 'Hire verified drivers\nfor your journey.',
    subtitleColor: '#4B5563',
    cardBg: '#FFFFFF',
    fogColors: [
      '#FFFFFF',
      'rgba(255, 255, 255, 0.75)',
      'rgba(255, 255, 255, 0)',
    ] as const,
    image: images.serviceDriverCard,
  },
  {
    id: 'roadside',
    title: 'Roadside Assistance',
    categoryTitle: 'Roadside Assistance',
    subtitle: 'Quick on-spot help for\ncommon issues.',
    subtitleColor: '#334155',
    cardBg: '#FFFFFF',
    fogColors: [
      '#FFFFFF',
      'rgba(255, 255, 255, 0.75)',
      'rgba(255, 255, 255, 0)',
    ] as const,
    image: images.serviceRoadsideCard,
  },
  {
    id: 'future',
    title: 'More Services',
    categoryTitle: 'More Services',
    subtitle: 'Car wash, inspection,\ninsurance and more.',
    subtitleColor: '#57534E',
    cardBg: '#FFFFFF',
    fogColors: [
      '#FFFFFF',
      'rgba(255, 255, 255, 0.75)',
      'rgba(255, 255, 255, 0)',
    ] as const,
    image: images.serviceMoreCard,
  },
];

export default function ServicesScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const { fetchServices } = useCatalogStore();

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  const openCategory = (categoryId: string, categoryTitle: string) => {
    openServiceCategory(navigation, categoryId, categoryTitle);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      const parent = navigation.getParent();
      (parent as any)?.navigate('Home', { screen: 'HomeMain' });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: px(16),
          paddingTop: px(12),
          paddingBottom: px(16),
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: px(42),
          }}>
          <Pressable
            onPress={handleBack}
            hitSlop={14}
            style={{
              position: 'absolute',
              left: 0,
              width: px(40),
              height: px(40),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ArrowLeft size={px(24)} color="#111827" strokeWidth={2.4} />
          </Pressable>
          <Text
            style={{
              fontSize: px(23),
              fontWeight: typography.weights.extrabold,
              color: '#111827',
              textAlign: 'center',
              letterSpacing: -0.4,
            }}>
            Services
          </Text>
        </View>
        <Text
          style={{
            marginTop: px(4),
            fontSize: px(13.5),
            color: '#4B5563',
            fontWeight: '500',
            textAlign: 'center',
          }}>
          Choose a service category to get started
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: px(14),
          paddingTop: px(16),
          paddingBottom: px(36),
          gap: px(16),
        }}
        showsVerticalScrollIndicator={false}>
        {SERVICE_CARDS.map(item => (
          <Pressable
            key={item.id}
            onPress={() => openCategory(item.id, item.categoryTitle)}
            style={({ pressed }) => [
              {
                width: '100%',
                height: px(150),
                borderRadius: px(22),
                overflow: 'hidden',
                backgroundColor: item.cardBg,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 3,
                transform: [{ scale: pressed ? 0.985 : 1 }],
                opacity: pressed ? 0.94 : 1,
              },
            ]}>
            {/* Right-Anchored Artwork with reduced height & soft left fog */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '58%',
                justifyContent: 'center',
                alignItems: 'flex-end',
                overflow: 'hidden',
              }}>
              <Image
                source={item.image}
                style={{
                  width: '100%',
                  height: '92%',
                }}
                resizeMode="cover"
              />

              {/* Soft Fog Gradient on the left edge of the artwork */}
              <LinearGradient
                colors={item.fogColors}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '40%',
                }}
              />
            </View>

            {/* Left-Aligned Text Content */}
            <View
              style={{
                flex: 1,
                paddingLeft: px(18),
                paddingRight: px(8),
                justifyContent: 'center',
                maxWidth: '54%',
                zIndex: 2,
              }}>
              <Text
                style={{
                  fontSize: px(19.5),
                  fontWeight: typography.weights.extrabold,
                  color: '#111827',
                  marginBottom: px(4),
                  letterSpacing: -0.3,
                }}>
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: px(13),
                  color: item.subtitleColor,
                  fontWeight: '600',
                  lineHeight: px(18.5),
                }}>
                {item.subtitle}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
