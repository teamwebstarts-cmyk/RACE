import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ServiceCategoryCard from '../components/ServiceCategoryCard';
import AppHeader from '../components/ui/AppHeader';
import FeatureList from '../components/ui/FeatureList';
import HeroBanner from '../components/ui/HeroBanner';
import HighlightCard from '../components/ui/HighlightCard';
import LocationBar from '../components/ui/LocationBar';
import Screen, { ScreenContent, SectionTitle } from '../components/ui/Screen';
import { useBrandQuery, useServicesQuery } from '../services/catalog/useCatalogQueries';
import type { HomeStackParamList } from '../types/navigation';
import { colors, layout, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen({ navigation }: Props) {
  const { data: brand, isLoading: brandLoading } = useBrandQuery();
  const { data: categories = [], isLoading: servicesLoading } = useServicesQuery();

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

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ScreenContent>
            <AppHeader brand={brand} />

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

            <SectionTitle
              title="our"
              highlight="services"
              subtitle="Tap a category to browse and book."
            />

            <View style={styles.grid}>
              {categories.map((category) => (
                <ServiceCategoryCard
                  key={category.id}
                  category={category}
                  onPress={() =>
                    navigation.navigate('ServiceList', {
                      categoryId: category.id,
                      categoryTitle: category.title,
                    })
                  }
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
});
