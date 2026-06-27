import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/ui/PrimaryButton';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import { colors, spacing, typography } from '../../theme';

export default function PartnerJobsScreen() {
  return (
    <Screen>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenContent style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="navigate-circle-outline" size={56} color={colors.primary} />
          </View>
          <Text style={styles.title}>No active jobs</Text>
          <Text style={styles.subtitle}>
            When a customer requests towing, driving, or roadside help in your area, jobs will
            appear here.
          </Text>
          <PrimaryButton label="Go online from Home" onPress={() => undefined} variant="outline" />
        </ScreenContent>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  iconWrap: { marginBottom: spacing.lg },
  title: {
    color: colors.textLight,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
