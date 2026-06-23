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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ServiceCategoryGridCard from '../components/services/ServiceCategoryGridCard';
import { HOME_HERO_IMAGE } from '../constants/home';
import { SERVICE_GRID_CARDS, SERVICES_TRUST_ITEMS } from '../constants/servicesScreen';
import { USER } from '../constants/demo';
import type { ServicesStackParamList } from '../types/navigation';
import { openServiceCategory } from '../utils/serviceNavigation';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicesMain'>;

export default function ServicesScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const openCategory = (categoryId: string, categoryTitle: string) => {
    openServiceCategory(navigation, categoryId, categoryTitle);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: px(20),
            paddingBottom: px(16) + insets.bottom,
          }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: px(28),
                  fontWeight: typography.weights.extrabold,
                  color: colors.dark,
                }}>
                Services
              </Text>
              <Text
                style={{
                  marginTop: px(4),
                  fontSize: px(13),
                  color: colors.grey,
                  lineHeight: px(18),
                }}>
                Choose a service category to get started
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(12) }}>
              <Pressable hitSlop={8} style={styles.bellWrap}>
                <Bell size={px(22)} color={colors.dark} strokeWidth={2} />
                <View style={styles.bellDot} />
              </Pressable>
              <View
                style={[
                  styles.avatar,
                  { width: px(40), height: px(40), borderRadius: px(20) },
                ]}>
                <Text
                  style={{
                    fontSize: px(15),
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                  }}>
                  {USER.name.charAt(0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Hero banner — dimensions match HomeScreen hero card */}
          <View
            style={[
              styles.heroCard,
              shadows.card,
              {
                borderRadius: px(20),
                marginTop: px(10),
                marginBottom: px(8),
                paddingTop: px(14),
                paddingBottom: px(10),
                paddingLeft: px(14),
                paddingRight: 0,
              },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: px(158),
                  flexShrink: 0,
                }}>
                <Text
                  style={{
                    fontSize: px(18),
                    fontWeight: typography.weights.extrabold,
                    color: colors.dark,
                    lineHeight: px(23),
                  }}>
                  We're here for you{' '}
                  <Text style={{ color: colors.primary }}>24/7</Text>
                </Text>
                <Text
                  style={{
                    marginTop: px(5),
                    fontSize: px(13),
                    color: colors.grey,
                    lineHeight: px(18),
                  }}>
                  Professional help, anytime you need it.
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: px(5),
                    marginTop: px(10),
                  }}>
                  {[0, 1, 2].map(index => (
                    <View
                      key={index}
                      style={{
                        width: index === 0 ? px(7) : px(6),
                        height: index === 0 ? px(7) : px(6),
                        borderRadius: px(4),
                        backgroundColor: index === 0 ? colors.primary : colors.border,
                      }}
                    />
                  ))}
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  height: px(140),
                  overflow: 'hidden',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  marginLeft: px(-10),
                }}>
                <Image
                  source={HOME_HERO_IMAGE}
                  style={{
                    width: px(210),
                    height: px(158),
                    marginLeft: px(-6),
                    marginRight: px(-28),
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Service categories */}
          <Text
            style={{
              fontSize: px(18),
              fontWeight: typography.weights.extrabold,
              color: colors.dark,
              marginBottom: px(12),
            }}>
            Service Categories
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: px(12),
              marginBottom: px(22),
            }}>
            {SERVICE_GRID_CARDS.map(card => (
              <ServiceCategoryGridCard
                key={card.id}
                title={card.title}
                description={card.description}
                servicesCount={card.servicesCount}
                Icon={card.Icon}
                comingSoon={card.comingSoon}
                scale={s}
                onPress={() =>
                  openCategory(card.categoryId, card.title)
                }
              />
            ))}
          </View>

          {/* Trust bar */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: colors.lightGrey,
              borderRadius: px(16),
              paddingVertical: px(14),
              paddingHorizontal: px(10),
            }}>
            {SERVICES_TRUST_ITEMS.map(item => (
              <View key={item.id} style={{ flex: 1, alignItems: 'center' }}>
                <item.Icon size={px(18)} color={colors.primary} strokeWidth={2} />
                <Text
                  style={{
                    marginTop: px(5),
                    fontSize: px(11),
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                    textAlign: 'center',
                  }}>
                  <Text style={{ color: colors.primary }}>{item.highlight}</Text>
                  {'\n'}
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bellWrap: {
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  avatar: {
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  heroCard: {
    backgroundColor: colors.background,
    borderWidth: 0,
    overflow: 'hidden',
  },
});
