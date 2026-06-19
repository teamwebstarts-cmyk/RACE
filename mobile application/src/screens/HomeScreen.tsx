import React from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import BookingCard from '../components/booking/BookingCard';
import QuickActionGrid from '../components/dashboard/QuickActionGrid';
import SosButton from '../components/dashboard/SosButton';
import VehicleCard from '../components/dashboard/VehicleCard';
import ServiceCategoryCard from '../components/ServiceCategoryCard';
import AppHeader from '../components/ui/AppHeader';
import FeatureList from '../components/ui/FeatureList';
import GlassCard from '../components/ui/GlassCard';
import HeroBanner from '../components/ui/HeroBanner';
import HighlightCard from '../components/ui/HighlightCard';
import LocationBar from '../components/ui/LocationBar';
import Screen, { ScreenContent, SectionTitle } from '../components/ui/Screen';
import { useBrandQuery, useServicesQuery } from '../services/catalog/useCatalogQueries';
import { useBookingsQuery } from '../services/bookings/useBookingQueries';
import { useVehiclesQuery } from '../services/vehicles/useVehicleQueries';
import type { HomeStackParamList, RootTabParamList } from '../types/navigation';
import { colors, layout, spacing, typography } from '../theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeMain'>,
  BottomTabScreenProps<RootTabParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { data: brand, isLoading: brandLoading } = useBrandQuery();
  const { data: categories = [], isLoading: servicesLoading } = useServicesQuery();
  const { data: vehicles = [] } = useVehiclesQuery();
  const { data: bookings = [] } = useBookingsQuery();

  const primaryVehicle = vehicles[0];
  const recentBookings = bookings.slice(0, 3);
  const totalServices = categories.reduce(
    (count, category) => count + category.services.length,
    0,
  );

  if (brandLoading || servicesLoading || !brand) {
    return (
      <Screen>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'tow') {
      navigation.navigate('ServiceList', { categoryId: 'towing', categoryTitle: 'Towing' });
      return;
    }
    if (actionId === 'driver') {
      navigation.navigate('ServiceList', { categoryId: 'driver', categoryTitle: 'Driver' });
      return;
    }
    navigation.navigate('ServiceList', { categoryId: 'roadside', categoryTitle: 'Roadside' });
  };

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ScreenContent>
            <AppHeader brand={brand} />
            <SosButton />

            {primaryVehicle ? (
              <VehicleCard
                vehicle={primaryVehicle}
                onViewQr={() =>
                  navigation.navigate('VehicleQrEmergency', { vehicleId: primaryVehicle.id })
                }
                onEdit={() => navigation.getParent()?.navigate('Profile', { screen: 'VehicleDetail', params: { vehicleId: primaryVehicle.id } })}
                onBook={() =>
                  navigation.navigate('ServiceList', { categoryId: 'towing', categoryTitle: 'Towing' })
                }
              />
            ) : (
              <GlassCard style={styles.emptyVehicle}>
                <Text style={styles.emptyTitle}>No vehicle added</Text>
                <Text style={styles.emptyText}>Add a vehicle to unlock emergency QR and faster booking.</Text>
              </GlassCard>
            )}

            <SectionTitle title="quick" highlight="actions" subtitle="Emergency roadside services" />
            <QuickActionGrid onAction={handleQuickAction} />

            <Pressable
              style={styles.banner}
              onPress={() =>
                navigation.getParent()?.navigate('Profile', { screen: 'SubscriptionPlans' })
              }>
              <Text style={styles.bannerTitle}>RACE Subscription</Text>
              <Text style={styles.bannerText}>Priority dispatch, zero wait surcharge, and annual roadside cover.</Text>
              <Text style={styles.bannerCta}>View Plans →</Text>
            </Pressable>

            {recentBookings.length > 0 ? (
              <>
                <SectionTitle title="recent" highlight="bookings" />
                {recentBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    compact
                    onPress={() =>
                      navigation.getParent()?.navigate('Bookings', {
                        screen: 'BookingDetail',
                        params: { bookingId: booking.id },
                      })
                    }
                  />
                ))}
              </>
            ) : null}

            <Text style={styles.catalogMeta}>
              {categories.length} categories · {totalServices} services
            </Text>

            <HeroBanner brand={brand} />

            <View style={styles.highlights}>
              {brand.highlights.map((item) => (
                <HighlightCard key={item.id} item={item} />
              ))}
            </View>

            <LocationBar location={brand.location} />

            <SectionTitle
              title="what"
              highlight="we offer"
              subtitle="Effective towing with under-lift and flatbed transportation services."
            />
            <FeatureList features={brand.features} />

            <SectionTitle title="our" highlight="services" subtitle="Tap a category to browse and book." />

            <View style={styles.grid}>
              {categories.map((category) => (
                <ServiceCategoryCard
                  key={category.id}
                  category={category}
                  onPress={() => {
                    if (category.id === 'future') {
                      navigation.navigate('MoreServices');
                      return;
                    }
                    navigation.navigate('ServiceList', {
                      categoryId: category.id,
                      categoryTitle: category.title,
                    });
                  }}
                />
              ))}
            </View>
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: layout.sectionGap,
  },
  catalogMeta: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.cardGap,
    marginBottom: layout.sectionGap,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyVehicle: { marginBottom: spacing.lg },
  emptyTitle: { color: colors.textLight, fontWeight: typography.weights.bold, fontSize: typography.sizes.lg },
  emptyText: { color: colors.subtext, marginTop: spacing.xs },
  banner: {
    marginVertical: spacing.lg,
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    padding: spacing.lg,
  },
  bannerTitle: { color: colors.secondary, fontWeight: typography.weights.bold, fontSize: typography.sizes.lg },
  bannerText: { color: colors.subtext, marginTop: spacing.xs, lineHeight: 20 },
  bannerCta: { color: colors.primary, fontWeight: typography.weights.bold, marginTop: spacing.sm },
});
