import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import SubscriptionCard from '../../components/subscription/SubscriptionCard';
import Screen, { ScreenContent } from '../../components/ui/Screen';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSubscription } from '../../redux/profile/profileSlice';
import { setBillingPeriod } from '../../redux/subscriptions/subscriptionsSlice';
import type { ProfileStackParamList } from '../../types/navigation';
import type { SubscriptionPlanId } from '../../types/profile';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SubscriptionPlans'>;

export default function SubscriptionPlansScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const plans = useAppSelector((state) => state.subscriptions.plans);
  const billingPeriod = useAppSelector((state) => state.subscriptions.billingPeriod);

  const handleSelect = (planId: SubscriptionPlanId) => {
    dispatch(setSubscription({ planId, status: 'active', expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() }));
    navigation.goBack();
  };

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenContent>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>Get more with RACE Premium</Text>

            <View style={styles.toggle}>
              <Pressable
                style={[styles.toggleBtn, billingPeriod === 'monthly' && styles.toggleActive]}
                onPress={() => dispatch(setBillingPeriod('monthly'))}>
                <Text style={[styles.toggleText, billingPeriod === 'monthly' && styles.toggleTextActive]}>
                  Monthly
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, billingPeriod === 'yearly' && styles.toggleActive]}
                onPress={() => dispatch(setBillingPeriod('yearly'))}>
                <Text style={[styles.toggleText, billingPeriod === 'yearly' && styles.toggleTextActive]}>
                  Yearly — Save 20%
                </Text>
              </Pressable>
            </View>

            {plans.map((plan) => (
              <SubscriptionCard key={plan.id} plan={plan} onSelect={() => handleSelect(plan.id)} />
            ))}

            <Text style={styles.disclaimer}>
              All plans include 24/7 emergency support and verified professionals.
            </Text>
          </ScreenContent>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.textDark, textAlign: 'center' },
  subtitle: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSoft,
    borderRadius: 24,
    padding: 4,
    marginBottom: spacing.xl,
  },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: 20, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontWeight: typography.weights.semibold, color: colors.textMuted, fontSize: typography.sizes.sm },
  toggleTextActive: { color: colors.textDark },
  disclaimer: { textAlign: 'center', color: colors.textMuted, fontSize: typography.sizes.sm, fontStyle: 'italic', marginTop: spacing.md },
});
