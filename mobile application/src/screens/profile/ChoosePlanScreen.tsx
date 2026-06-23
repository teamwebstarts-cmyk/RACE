import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { ArrowRight, Building2, Car, Check, Truck, X } from 'lucide-react-native';

import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import {
  DRIVER_PLANS,
  TOWING_PLANS,
  getPlanPriceLabel,
  type BillingCycle,
} from '../../constants/choosePlan';
import type { PlanFeature, SubscriptionPlan } from '../../types/models';
import { colors, shadows, typography } from '../../theme';

function isFeatureObject(feature: PlanFeature | string): feature is PlanFeature {
  return typeof feature !== 'string';
}

function TowingPlanCard({
  plan,
  cycle,
  px,
}: {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  px: (n: number) => number;
}) {
  const popular = plan.isPopular;

  return (
    <View
      style={[
        {
          borderRadius: px(14),
          borderWidth: popular ? 0 : 1,
          borderColor: colors.border,
          backgroundColor: popular ? colors.primary : colors.background,
          padding: px(14),
          marginBottom: px(12),
          position: 'relative',
        },
        !popular ? shadows.card : undefined,
      ]}>
      {popular ? (
        <View
          style={{
            position: 'absolute',
            top: px(12),
            right: px(12),
            paddingHorizontal: px(10),
            paddingVertical: px(4),
            borderRadius: px(12),
            backgroundColor: colors.background,
          }}>
          <Text style={{ fontSize: px(9), fontWeight: typography.weights.bold, color: colors.primary }}>
            MOST POPULAR
          </Text>
        </View>
      ) : null}

      <Text
        style={{
          fontSize: px(18),
          fontWeight: typography.weights.extrabold,
          color: popular ? colors.background : colors.dark,
          marginBottom: px(4),
        }}>
        {plan.name}
      </Text>
      <Text
        style={{
          fontSize: px(15),
          fontWeight: typography.weights.bold,
          color: popular ? colors.background : colors.primary,
          marginBottom: px(10),
        }}>
        {getPlanPriceLabel(plan.price, cycle)}
      </Text>

      <View style={{ height: 1, backgroundColor: popular ? 'rgba(255,255,255,0.25)' : colors.border, marginBottom: px(10) }} />

      {plan.features.map(feature => {
        const text = isFeatureObject(feature) ? feature.text : feature;
        const included = isFeatureObject(feature) ? feature.included : true;
        const Icon = included ? Check : X;
        return (
          <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: px(8), marginBottom: px(6) }}>
            <Icon
              size={px(14)}
              color={included ? (popular ? colors.background : colors.primary) : colors.grey}
              strokeWidth={2.5}
            />
            <Text style={{ flex: 1, fontSize: px(12), color: popular ? colors.background : colors.dark }}>{text}</Text>
          </View>
        );
      })}

      <Pressable
        onPress={() => Alert.alert(plan.name, `${plan.name} plan selected.`)}
        style={{
          alignSelf: 'flex-end',
          marginTop: px(8),
          flexDirection: 'row',
          alignItems: 'center',
          gap: px(4),
          paddingHorizontal: px(14),
          paddingVertical: px(8),
          borderRadius: px(10),
          backgroundColor: popular ? colors.background : colors.background,
          borderWidth: popular ? 0 : 1.5,
          borderColor: colors.primary,
        }}>
        <Text
          style={{
            fontSize: px(12),
            fontWeight: typography.weights.bold,
            color: popular ? colors.primary : colors.primary,
          }}>
          {popular ? 'Get Premium' : plan.name === 'Family' ? 'Get Family Plan' : 'Get Started'}
        </Text>
        {popular ? <ArrowRight size={px(14)} color={colors.primary} strokeWidth={2.5} /> : null}
      </Pressable>
    </View>
  );
}

export default function ChoosePlanScreen() {
  const px = useProfilePx();
  const [cycle, setCycle] = useState<BillingCycle>('yearly');

  return (
    <ProfileSubScreenLayout title="Choose Your Plan" subtitle="Get more with RACE Premium">
      <View
        style={{
          flexDirection: 'row',
          borderRadius: px(24),
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.lightGrey,
          padding: px(4),
          marginBottom: px(18),
        }}>
        {(['monthly', 'yearly'] as BillingCycle[]).map(option => {
          const active = cycle === option;
          return (
            <Pressable
              key={option}
              onPress={() => setCycle(option)}
              style={{
                flex: 1,
                paddingVertical: px(10),
                borderRadius: px(20),
                backgroundColor: active ? colors.primary : 'transparent',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: px(12),
                  fontWeight: typography.weights.bold,
                  color: active ? colors.dark : colors.grey,
                }}>
                {option === 'monthly' ? 'Monthly' : 'Yearly — Save 20%'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(6), marginBottom: px(10) }}>
        <Truck size={px(16)} color={colors.primary} strokeWidth={2.2} />
        <Text style={{ fontSize: px(15), fontWeight: typography.weights.bold, color: colors.dark }}>Towing Plans</Text>
      </View>
      {TOWING_PLANS.map(plan => (
        <TowingPlanCard key={plan.id} plan={plan} cycle={cycle} px={px} />
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(6), marginTop: px(4), marginBottom: px(10) }}>
        <Car size={px(16)} color={colors.primary} strokeWidth={2.2} />
        <Text style={{ fontSize: px(15), fontWeight: typography.weights.bold, color: colors.dark }}>
          Driver Service Plans
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: px(10), marginBottom: px(16) }}>
        {DRIVER_PLANS.map(plan => (
          <View
            key={plan.id}
            style={{
              flex: 1,
              borderRadius: px(14),
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              padding: px(12),
            }}>
            <View
              style={{
                width: px(36),
                height: px(36),
                borderRadius: px(18),
                backgroundColor: colors.goldLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: px(8),
              }}>
              {plan.name === 'Corporate' ? (
                <Building2 size={px(18)} color={colors.primary} strokeWidth={2.2} />
              ) : (
                <Car size={px(18)} color={colors.primary} strokeWidth={2.2} />
              )}
            </View>
            <Text style={{ fontSize: px(13), fontWeight: typography.weights.bold, color: colors.dark, marginBottom: px(4) }}>
              {plan.name}
            </Text>
            <Text style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: colors.primary, marginBottom: px(8) }}>
              {getPlanPriceLabel(plan.price, cycle)}
            </Text>
            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: px(8) }} />
            {plan.features.map(feature => {
              const text = typeof feature === 'string' ? feature : feature.text;
              return (
                <Text key={text} style={{ fontSize: px(10), color: colors.grey, marginBottom: px(4) }}>
                  • {text}
                </Text>
              );
            })}
            <Pressable
              onPress={() => Alert.alert(plan.name, `${plan.name} plan selected.`)}
              style={{
                marginTop: px(8),
                paddingVertical: px(8),
                borderRadius: px(10),
                backgroundColor: plan.name === 'Corporate' ? colors.background : colors.primary,
                borderWidth: plan.name === 'Corporate' ? 1.5 : 0,
                borderColor: colors.primary,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: px(11),
                  fontWeight: typography.weights.bold,
                  color: plan.name === 'Corporate' ? colors.primary : colors.dark,
                }}>
                {plan.name === 'Corporate' ? 'Contact Us' : 'Book Now'}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: px(11), color: colors.grey, textAlign: 'center', fontStyle: 'italic', lineHeight: px(16) }}>
        All plans include 24/7 emergency support and verified professionals.
      </Text>
    </ProfileSubScreenLayout>
  );
}
