import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ServiceItemCard from '../components/ServiceItemCard';
import Screen, { ScreenContent } from '../components/ui/Screen';
import ServiceIcon from '../components/ui/ServiceIcon';
import { getCategoryById } from '../constants/services';
import { colors, getCategoryTheme, radius, spacing, typography } from '../theme';

export default function ServiceListScreen({ route, navigation }) {
  const { categoryId } = route.params;
  const category = getCategoryById(categoryId);
  const theme = getCategoryTheme(categoryId);

  if (!category) {
    return (
      <Screen>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Category not found.</Text>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ScreenContent>
            <View style={[styles.hero, { backgroundColor: theme.background }]}>
              <View
                style={[
                  styles.heroIconWrap,
                  { backgroundColor: theme.iconBackground },
                ]}>
                <ServiceIcon
                  categoryId={category.id}
                  emoji={category.icon}
                  size={32}
                />
              </View>
              <Text style={[styles.heroTitle, { color: theme.accent }]}>
                {category.title}
              </Text>
              <Text style={styles.heroSubtitle}>
                {category.description ||
                  (category.comingSoon
                    ? 'These services are coming soon to the RACE Service app.'
                    : 'Choose a service to continue booking with Towy.')}
              </Text>
            </View>

            {category.services.map(service => (
              <ServiceItemCard
                key={service.id}
                service={service}
                accent={theme.accent}
                disabled={category.comingSoon}
                onPress={() => {
                  if (!category.comingSoon) {
                    navigation.navigate('SelectService', {
                      categoryId: category.id,
                      serviceId: service.id,
                      serviceLabel: service.label,
                      serviceDescription: service.description,
                    });
                  }
                }}
              />
            ))}
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
    paddingBottom: spacing.xxxl,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: typography.lineHeights.normal,
  },
  errorText: {
    padding: spacing.xl,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
});
