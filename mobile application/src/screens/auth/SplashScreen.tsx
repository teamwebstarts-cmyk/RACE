import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';

import BrandLogo from '../../components/ui/BrandLogo';
import { useAppSelector } from '../../redux/hooks';
import { shouldUsePartnerExperience } from '../../utils/roleRouting';
import type { AuthStackParamList, RootStackParamList } from '../../types/navigation';
import { brand, colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated && Boolean(state.auth.accessToken),
  );
  const user = useAppSelector((state) => state.auth.user);
  const useCustomerExperience = useAppSelector((state) => state.auth.useCustomerExperience);
  const introSlidesCompleted = useAppSelector((state) => state.onboarding.introSlidesCompleted);
  const onboardingRequired = useAppSelector((state) => state.auth.onboardingRequired);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && !onboardingRequired) {
        if (shouldUsePartnerExperience(user, useCustomerExperience)) {
          navigation.replace('Partner');
        } else {
          navigation.replace('Main');
        }
        return;
      }
      navigation.replace('Auth', {
        screen: introSlidesCompleted ? 'AccountType' : 'Onboarding',
      } as NavigatorScreenParams<AuthStackParamList>);
    }, 2200);

    return () => clearTimeout(timer);
  }, [
    navigation,
    isAuthenticated,
    onboardingRequired,
    introSlidesCompleted,
    user,
    useCustomerExperience,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <BrandLogo size="large" />
        <Text style={styles.name}>{brand.name}</Text>
        <Text style={styles.tagline}>{brand.tagline}</Text>
      </Animated.View>
      <View style={styles.loader}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotDelay]} />
        <View style={[styles.dot, styles.dotDelay2]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceDarker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { alignItems: 'center' },
  name: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    letterSpacing: 2,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  loader: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  dotDelay: { opacity: 0.7 },
  dotDelay2: { opacity: 1 },
});
