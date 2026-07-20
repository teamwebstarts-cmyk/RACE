import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { images, categoryIcons } from '../../assets';
import { useAppDispatch } from '../../redux/hooks';
import { clearSignupPath, setSignupPath } from '../../redux/onboarding/onboardingSlice';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, layout, radius, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'AccountType'>;

const REF_W = 390;

export default function AccountTypeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = width / REF_W;
  const px = (n: number) => Math.max(1, Math.round(n * scale));

  const handleGetStarted = () => {
    dispatch(setSignupPath({ accountType: 'customer', vendorType: null }));
    navigation.navigate('MobileNumber');
  };

  const handleAlreadyUser = () => {
    dispatch(clearSignupPath());
    navigation.navigate('MobileNumber');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.pageBg} />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: px(layout.screenPadding),
            paddingBottom: insets.bottom + px(spacing.xl),
          },
        ]}>
        <View style={[styles.brandBlock, { marginTop: px(spacing.md) }]}>
          <Text style={[styles.brandRace, { fontSize: px(22) }]}>RACE</Text>
          <Text style={[styles.brandService, { fontSize: px(12) }]}>SERVICE</Text>
        </View>

        <View style={[styles.heroCard, shadows.card, { marginTop: px(spacing.xl), borderRadius: px(20) }]}>
          <Image source={images.logo} style={{ width: px(72), height: px(72) }} resizeMode="contain" />
          <Text style={[styles.heroTitle, { fontSize: px(22), lineHeight: px(28), marginTop: px(14) }]}>
            24/7 Roadside Assistance{'\n'}& Towing Service
          </Text>
          <Text style={[styles.heroSubtitle, { fontSize: px(14), lineHeight: px(20), marginTop: px(8) }]}>
            Fast help when you need it — book towing, drivers, and roadside support in minutes.
          </Text>
          <Image
            source={categoryIcons.towing}
            style={{ width: '100%', height: px(200), marginTop: px(spacing.lg) }}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.actions, { marginTop: px(spacing.xxl), gap: px(12) }]}>
          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.primaryButton,
              { minHeight: px(54), borderRadius: px(14) },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.primaryLabel, { fontSize: px(17) }]}>Get Started</Text>
          </Pressable>

          <Pressable
            onPress={handleAlreadyUser}
            style={({ pressed }) => [
              styles.secondaryButton,
              { minHeight: px(54), borderRadius: px(14) },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.secondaryLabel, { fontSize: px(16) }]}>I'm Already a User</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Onboarding')}
          style={({ pressed }) => [
            styles.footerLink,
            { marginTop: px(spacing.lg) },
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.footerText, { fontSize: px(13) }]}>
            See how RACE works
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.pageBg },
  content: { flexGrow: 1 },
  brandBlock: { alignItems: 'center' },
  brandRace: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.5,
  },
  brandService: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.8,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    color: colors.dark,
    fontWeight: typography.weights.extrabold,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: colors.grey,
    textAlign: 'center',
  },
  actions: {},
  primaryButton: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: colors.dark,
    fontWeight: typography.weights.semibold,
  },
  footerLink: { alignItems: 'center', paddingVertical: spacing.sm },
  footerText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.semibold,
  },
  pressed: { opacity: 0.9 },
});
