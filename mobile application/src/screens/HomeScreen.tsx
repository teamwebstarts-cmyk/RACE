import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Bell,
  ChevronDown,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  getGreeting,
  HOME_HERO_IMAGE,
  HOME_STATS,
  POPULAR_SERVICES,
  QUICK_SERVICES,
  TRUST_ITEMS,
} from '../constants/home';
import { USER } from '../constants/demo';
import { brand } from '../theme/brand';
import type { HomeStackParamList, RootTabParamList } from '../types/navigation';
import { openServiceCategory } from '../utils/serviceNavigation';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const tabNav = navigation.getParent<BottomTabNavigationProp<RootTabParamList>>();

  const openCategory = (categoryId: string, categoryTitle: string) => {
    openServiceCategory(navigation, categoryId, categoryTitle);
  };

  const openServicesTab = () => {
    tabNav?.navigate('Services');
  };

  const callSupport = () => {
    void Linking.openURL(`tel:${brand.phoneRaw}`);
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
                  fontSize: px(20),
                  fontWeight: typography.weights.extrabold,
                  color: colors.dark,
                }}>
                {getGreeting(USER.name)}
              </Text>
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: px(4),
                  gap: px(4),
                }}>
                <MapPin size={px(14)} color={colors.primary} strokeWidth={2.5} />
                <Text
                  style={{
                    fontSize: px(13),
                    fontWeight: typography.weights.semibold,
                    color: colors.primary,
                  }}>
                  {brand.location}
                </Text>
                <ChevronDown size={px(14)} color={colors.primary} />
              </Pressable>
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

          {/* Hero card */}
          <View
            style={[
              styles.heroCard,
              shadows.card,
              {
                borderRadius: px(20),
                marginTop: px(16),
                marginBottom: px(18),
                padding: px(14),
                paddingRight: 0,
              },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: px(158), flexShrink: 0 }}>
                <Text
                  style={{
                    fontSize: px(18),
                    fontWeight: typography.weights.extrabold,
                    color: colors.dark,
                    lineHeight: px(23),
                  }}>
                  <Text style={{ color: colors.primary }}>24/7 </Text>
                  Roadside Assistance
                </Text>
                <Text
                  style={{
                    marginTop: px(5),
                    fontSize: px(11),
                    color: colors.grey,
                    lineHeight: px(15),
                  }}>
                  We're always ready to help you get moving.
                </Text>

                <View
                  style={{
                    marginTop: px(12),
                    gap: px(8),
                    width: '100%',
                  }}>
                  <Pressable
                    onPress={() => openCategory('roadside', 'Roadside Assistance')}
                    style={{
                      width: '100%',
                      height: px(38),
                      borderRadius: px(10),
                      backgroundColor: colors.primary,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: px(10),
                      gap: px(6),
                    }}>
                    <Phone size={px(13)} color={colors.dark} strokeWidth={2.5} />
                    <Text
                      style={{
                        fontSize: px(12),
                        fontWeight: typography.weights.bold,
                        color: colors.dark,
                      }}>
                      Request Help
                    </Text>
                    <ArrowRight size={px(14)} color={colors.dark} strokeWidth={2.5} />
                  </Pressable>
                  <Pressable
                    onPress={callSupport}
                    style={{
                      width: '100%',
                      height: px(38),
                      borderRadius: px(10),
                      borderWidth: 1.5,
                      borderColor: colors.primary,
                      backgroundColor: colors.background,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: px(10),
                      gap: px(6),
                    }}>
                    <MessageCircle size={px(13)} color={colors.primary} strokeWidth={2} />
                    <Text
                      style={{
                        fontSize: px(12),
                        fontWeight: typography.weights.semibold,
                        color: colors.dark,
                      }}>
                      Call Support
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: px(10),
                    gap: px(5),
                  }}>
                  <View
                    style={{
                      width: px(6),
                      height: px(6),
                      borderRadius: px(3),
                      backgroundColor: colors.success,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: px(10),
                      fontWeight: typography.weights.semibold,
                      color: colors.success,
                    }}>
                    Live · We're Available
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  height: px(152),
                  overflow: 'hidden',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}>
                <Image
                  source={HOME_HERO_IMAGE}
                  style={{
                    width: px(210),
                    height: px(158),
                    marginRight: px(-28),
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Quick services */}
          <View style={{ flexDirection: 'row', gap: px(8), marginBottom: px(18) }}>
            {QUICK_SERVICES.map(item => (
              <Pressable
                key={item.id}
                onPress={() => openCategory(item.categoryId, item.categoryTitle)}
                style={[
                  styles.quickCard,
                  shadows.card,
                  {
                    borderRadius: px(14),
                    height: px(78),
                    paddingTop: px(8),
                    paddingBottom: px(8),
                    paddingHorizontal: px(4),
                  },
                ]}>
                <item.Icon size={px(18)} color={colors.primary} strokeWidth={2} />
                <Text
                  numberOfLines={2}
                  style={{
                    marginTop: px(4),
                    fontSize: px(10),
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                    textAlign: 'center',
                    lineHeight: px(12),
                  }}>
                  {item.label}
                </Text>
                <ArrowRight
                  size={px(11)}
                  color={colors.primary}
                  strokeWidth={2.5}
                  style={{ marginTop: px(4) }}
                />
              </Pressable>
            ))}
          </View>

          {/* Trust bar */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: px(20),
              paddingHorizontal: px(2),
            }}>
            {TRUST_ITEMS.map(item => (
              <View key={item.id} style={{ flex: 1, alignItems: 'center' }}>
                <item.Icon size={px(20)} color={colors.primary} strokeWidth={2} />
                <Text
                  style={{
                    marginTop: px(6),
                    fontSize: px(12),
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

          {/* Popular services */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: px(14),
            }}>
            <Text
              style={{
                fontSize: px(18),
                fontWeight: typography.weights.extrabold,
                color: colors.dark,
              }}>
              Popular Services
            </Text>
            <Pressable
              onPress={openServicesTab}
              style={{ flexDirection: 'row', alignItems: 'center', gap: px(2) }}>
              <Text
                style={{
                  fontSize: px(13),
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                View All
              </Text>
              <ArrowRight size={px(14)} color={colors.primary} strokeWidth={2.5} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: px(12) }}
            style={{ marginBottom: px(20) }}>
            {POPULAR_SERVICES.map(item => (
              <Pressable
                key={item.id}
                onPress={() => openCategory(item.categoryId, item.categoryTitle)}
                style={[
                  styles.popularCard,
                  shadows.card,
                  { width: px(148), borderRadius: px(16) },
                ]}>
                <Image
                  source={item.image as ImageSourcePropType}
                  style={{
                    width: '100%',
                    height: px(100),
                    borderTopLeftRadius: px(16),
                    borderTopRightRadius: px(16),
                  }}
                  resizeMode="cover"
                />
                <View style={{ padding: px(12) }}>
                  <Text
                    style={{
                      fontSize: px(13),
                      fontWeight: typography.weights.bold,
                      color: colors.dark,
                      marginBottom: px(6),
                    }}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(4) }}>
                    <Text style={{ fontSize: px(12), color: colors.grey }}>From</Text>
                    <Text
                      style={{
                        fontSize: px(13),
                        fontWeight: typography.weights.bold,
                        color: colors.primary,
                      }}>
                      ₹{item.price}
                    </Text>
                    <ArrowRight size={px(12)} color={colors.primary} strokeWidth={2.5} />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {/* Stats */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: colors.lightGrey,
              borderRadius: px(16),
              paddingVertical: px(18),
              paddingHorizontal: px(8),
            }}>
            {HOME_STATS.map(item => (
              <View key={item.id} style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: px(44),
                    height: px(44),
                    borderRadius: px(22),
                    backgroundColor: colors.goldLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: px(8),
                  }}>
                  <item.Icon size={px(20)} color={colors.primary} strokeWidth={2} />
                </View>
                <Text
                  style={{
                    fontSize: px(14),
                    fontWeight: typography.weights.extrabold,
                    color: colors.dark,
                    textAlign: 'center',
                  }}>
                  {item.value}
                </Text>
                <Text
                  style={{
                    marginTop: px(2),
                    fontSize: px(10),
                    color: colors.grey,
                    textAlign: 'center',
                    lineHeight: px(13),
                  }}>
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
  quickCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  popularCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
