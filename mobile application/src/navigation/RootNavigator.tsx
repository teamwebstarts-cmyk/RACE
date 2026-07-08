import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import PartnerNavigator from './PartnerNavigator';
import { useAuthSessionSync } from '../hooks/useAuthSessionSync';
import { useAppSelector } from '../redux/hooks';
import { useAuthStore } from '../store/authStore';
import { shouldUsePartnerExperience } from '../utils/roleRouting';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.backgroundSoft,
    card: colors.surfaceDark,
    text: colors.textLight,
    border: colors.borderLight,
    notification: colors.accentRed,
  },
};

export default function RootNavigator() {
  useAuthSessionSync();

  const user = useAppSelector((state) => state.auth.user);
  const useCustomerExperience = useAppSelector((state) => state.auth.useCustomerExperience);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated && Boolean(accessToken),
  );
  const onboardingRequired = useAuthStore((state) => state.onboardingRequired);
  const canEnterApp = isAuthenticated && !onboardingRequired;

  const showPartner = canEnterApp && shouldUsePartnerExperience(user, useCustomerExperience);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {canEnterApp ? (
          showPartner ? (
            <Stack.Screen name="Partner" component={PartnerNavigator} />
          ) : (
            <Stack.Screen name="Main" component={MainNavigator} />
          )
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export function AuthBootstrapLoader() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceDarker,
  },
});
