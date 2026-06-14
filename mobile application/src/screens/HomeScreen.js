import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { checkApiHealth, fetchServiceCatalog } from '../api/client';
import ServiceCategoryCard from '../components/ServiceCategoryCard';
import AppHeader from '../components/ui/AppHeader';
import FeatureList from '../components/ui/FeatureList';
import HeroBanner from '../components/ui/HeroBanner';
import HighlightCard from '../components/ui/HighlightCard';
import LocationBar from '../components/ui/LocationBar';
import Screen, { ScreenContent, SectionTitle } from '../components/ui/Screen';
import { SERVICE_CATEGORIES } from '../constants/services';
import { brand, colors, layout, spacing, typography } from '../theme';

export default function HomeScreen({ navigation }) {
  const [apiStatus, setApiStatus] = useState('checking');
  const [categories, setCategories] = useState(SERVICE_CATEGORIES);

  useEffect(() => {
    checkApiHealth()
      .then(() => {
        setApiStatus('online');
        return fetchServiceCatalog();
      })
      .then(catalog => {
        if (catalog?.length) {
          setCategories(catalog);
        }
      })
      .catch(() => {
        setApiStatus('offline');
      });
  }, []);

  const totalServices = categories.reduce(
    (count, category) => count + category.services.length,
    0,
  );

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ScreenContent>
            <AppHeader brand={brand} />

            <View style={styles.statusRow}>
              {apiStatus === 'checking' ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View
                  style={[
                    styles.statusDot,
                    apiStatus === 'online' ? styles.online : styles.offline,
                  ]}
                />
              )}
              <Text style={styles.statusText}>
                API {apiStatus === 'checking' ? 'connecting...' : apiStatus}
                {' · '}
                {categories.length} categories · {totalServices} services
              </Text>
            </View>

            <HeroBanner brand={brand} />

            <View style={styles.highlights}>
              {brand.highlights.map(item => (
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
              subtitle="All available services — tap a category to see details."
            />

            <View style={styles.grid}>
              {categories.map(category => (
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
  scrollContent: {
    paddingBottom: layout.sectionGap,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  online: {
    backgroundColor: colors.success,
  },
  offline: {
    backgroundColor: colors.error,
  },
  statusText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.semibold,
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
