import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
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
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  CATEGORY_HERO_IMAGES,
  getGreeting,
  HOME_HERO_IMAGE,
  HOME_STATS,
  TRUST_ITEMS,
} from '../constants/home';
import { getServiceCategoryIcon } from '../constants/servicesScreen';
import { images } from '../assets';
import AppScreenLayout from '../components/ui/AppScreenLayout';
import TabRootHeader from '../components/ui/TabRootHeader';
import { useAuthStore } from '../store/authStore';
import { useCatalogStore } from '../store/catalogStore';
import { useProfileStore } from '../store/profileStore';
import { useUserLocationStore } from '../store/userLocationStore';
import { getProfileFirstName } from '../utils/profileDisplay';
import { brand } from '../theme/brand';
import type { HomeStackParamList, RootTabParamList } from '../types/navigation';
import { openServiceCategory } from '../utils/serviceNavigation';
import { formatLocationLabel } from '../utils/locationDisplay';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const { services, fetchServices, fetchBrand, brand: apiBrand, isLoading, error } =
    useCatalogStore();
  const profile = useProfileStore(state => state.profile);
  const authUser = useAuthStore(state => state.user);
  const savedLocation = useUserLocationStore(state => state.location);
  const hydrateLocation = useUserLocationStore(state => state.hydrate);
  const fetchCurrentLocation = useUserLocationStore(state => state.fetchCurrentLocation);
  const isLocating = useUserLocationStore(state => state.isLocating);
  const isLocationHydrated = useUserLocationStore(state => state.isHydrated);

  useEffect(() => {
    void fetchServices();
    void fetchBrand();
  }, [fetchBrand, fetchServices]);

  useEffect(() => {
    let mounted = true;

    async function initLocation() {
      await hydrateLocation();
      if (!mounted) return;

      const current = useUserLocationStore.getState().location;
      if (!current) {
        await fetchCurrentLocation();
      }
    }

    void initLocation();

    return () => {
      mounted = false;
    };
  }, [fetchCurrentLocation, hydrateLocation]);

  const quickItems = useMemo(() => {
    return services.slice(0, 4).map(category => ({
      id: category.id,
      label: category.title,
      categoryId: category.id,
      categoryTitle: category.title,
      Icon: getServiceCategoryIcon(category.id),
    }));
  }, [services]);

  const popularItems = useMemo(() => {
    return services.flatMap(category =>
      category.services.map(service => ({
        id: service.id,
        title: service.label,
        categoryId: category.id,
        categoryTitle: category.title,
        image:
          CATEGORY_HERO_IMAGES[category.id as keyof typeof CATEGORY_HERO_IMAGES] ??
          images.homePopularTowing,
      })),
    ).slice(0, 6);
  }, [services]);

  const displayName =
    getProfileFirstName(profile?.fullName) ||
    getProfileFirstName(authUser?.fullName) ||
    'there';
  const displayLocation = useMemo(() => {
    if (savedLocation) {
      return formatLocationLabel(savedLocation);
    }
    if (isLocationHydrated && !isLocating) {
      return 'Set your location';
    }
    return 'Locating...';
  }, [isLocationHydrated, isLocating, savedLocation]);

  const callSupport = () => {
    const phone = apiBrand?.phoneRaw ?? brand.phoneRaw;
    void Linking.openURL(`tel:${phone}`);
  };

  const openServicesTab = () => {
    const tabNav = navigation.getParent<BottomTabNavigationProp<RootTabParamList>>();
    tabNav?.navigate('Services');
  };

  const openCategory = (categoryId: string, categoryTitle: string) => {
    openServiceCategory(navigation, categoryId, categoryTitle);
  };

  return (
    <AppScreenLayout
      contentStyle={{ paddingTop: px(10) }}
      header={
        <TabRootHeader
          title={getGreeting(displayName)}
          subtitle="What do you need help with today?"
          actions={
            <Pressable
              onPress={() => navigation.navigate('SelectLocation')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(4),
                maxWidth: px(140),
              }}>
              <MapPin size={px(14)} color={colors.primary} strokeWidth={2.2} />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: px(11),
                  fontWeight: typography.weights.semibold,
                  color: colors.dark,
                  flexShrink: 1,
                }}>
                {displayLocation}
              </Text>
              <ChevronDown size={px(12)} color={colors.grey} />
            </Pressable>
          }
        />
      }>
          {/* Hero */}
          <View
            style={[
              styles.heroCard,
              shadows.card,
              {
                borderRadius: px(20),
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
          {isLoading && services.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: px(24), marginBottom: px(18) }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ marginTop: px(8), fontSize: px(12), color: colors.grey }}>
                Loading services...
              </Text>
            </View>
          ) : error && services.length === 0 ? (
            <Pressable
              onPress={() => void fetchServices()}
              style={{
                alignItems: 'center',
                paddingVertical: px(20),
                marginBottom: px(18),
                borderRadius: px(12),
                backgroundColor: colors.lightGrey,
              }}>
              <Text style={{ fontSize: px(13), color: colors.error, textAlign: 'center' }}>
                {error}
              </Text>
              <Text
                style={{
                  marginTop: px(6),
                  fontSize: px(12),
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                Tap to retry
              </Text>
            </Pressable>
          ) : quickItems.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: px(8), marginBottom: px(18) }}>
              {quickItems.map(item => (
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
          ) : null}

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
          {popularItems.length > 0 ? (
            <>
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
                {popularItems.map(item => (
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
                        <Text
                          style={{
                            fontSize: px(12),
                            fontWeight: typography.weights.bold,
                            color: colors.primary,
                          }}>
                          Book now
                        </Text>
                        <ArrowRight size={px(12)} color={colors.primary} strokeWidth={2.5} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}

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
                  }}>
                  {item.value}
                </Text>
                <Text
                  style={{
                    marginTop: px(2),
                    fontSize: px(10),
                    color: colors.grey,
                    textAlign: 'center',
                  }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.background,
    borderWidth: 0,
    overflow: 'hidden',
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  popularCard: {
    backgroundColor: colors.background,
    borderWidth: 0,
    overflow: 'hidden',
  },
});
