import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ServiceCategoryGridCard from '../components/services/ServiceCategoryGridCard';
import AppScreenLayout from '../components/ui/AppScreenLayout';
import TabRootHeader from '../components/ui/TabRootHeader';
import { HOME_HERO_IMAGE } from '../constants/home';
import { mapApiCategoryToGridCard, SERVICES_TRUST_ITEMS } from '../constants/servicesScreen';
import { useCatalogStore } from '../store/catalogStore';
import type { ServicesStackParamList } from '../types/navigation';
import { openServiceCategory } from '../utils/serviceNavigation';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicesMain'>;

export default function ServicesScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const { services, fetchServices, isLoading, error } = useCatalogStore();

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  const safeServices = Array.isArray(services) ? services : [];
  const gridCards = safeServices.map(mapApiCategoryToGridCard);

  const openCategory = (categoryId: string, categoryTitle: string) => {
    openServiceCategory(navigation, categoryId, categoryTitle);
  };

  return (
    <AppScreenLayout
      backgroundColor={colors.pageBg}
      contentStyle={{ paddingTop: px(10) }}
      header={
        <TabRootHeader
          title="Services"
          subtitle="Choose a service category to get started"
          onAvatarPress={() => {
            const parent = navigation.getParent();
            parent?.navigate('Profile' as never);
          }}
        />
      }>
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
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={HOME_HERO_IMAGE}
                  style={{
                    width: px(180),
                    height: px(140),
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          <Text
            style={{
              fontSize: px(18),
              fontWeight: typography.weights.extrabold,
              color: colors.dark,
              marginBottom: px(12),
            }}>
            Service Categories
          </Text>

          {isLoading && gridCards.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: px(40) }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: px(10), fontSize: px(13), color: colors.grey }}>
                Loading services...
              </Text>
            </View>
          ) : error && gridCards.length === 0 ? (
            <Pressable
              onPress={() => void fetchServices()}
              style={{
                alignItems: 'center',
                paddingVertical: px(32),
                borderRadius: px(12),
                backgroundColor: colors.lightGrey,
                marginBottom: px(22),
              }}>
              <Text style={{ fontSize: px(14), color: colors.error, textAlign: 'center' }}>
                {error}
              </Text>
              <Text
                style={{
                  marginTop: px(8),
                  fontSize: px(13),
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                Tap to retry
              </Text>
            </Pressable>
          ) : gridCards.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: px(32),
                marginBottom: px(22),
              }}>
              <Text style={{ fontSize: px(14), color: colors.grey, textAlign: 'center' }}>
                No services available right now.
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                rowGap: px(12),
                marginBottom: px(22),
              }}>
              {gridCards.map(card => (
                <ServiceCategoryGridCard
                  key={card.id}
                  title={card.title}
                  description={card.description}
                  servicesCount={card.servicesCount}
                  Icon={card.Icon}
                  comingSoon={card.comingSoon}
                  scale={s}
                  onPress={() => openCategory(card.categoryId, card.title)}
                />
              ))}
            </View>
          )}

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
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.background,
    borderWidth: 0,
    overflow: 'hidden',
  },
});
