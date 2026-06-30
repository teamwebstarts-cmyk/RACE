import React, { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../hooks/useAuth';
import PartnerAuthNavigator from './PartnerAuthNavigator';
import type { PartnerRootStackParamList } from '../types/partnerNavigation';
import { colors } from '../theme';

const PartnerNavigator = React.lazy(() => import('./PartnerNavigator'));

const RootStack = createNativeStackNavigator<PartnerRootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.cardBg,
    text: colors.dark,
    border: colors.border,
    notification: colors.error,
  },
};

export default function PartnerAppNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator
        initialRouteName="PartnerBootstrap"
        screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="PartnerBootstrap" component={PartnerAuthNavigator} />
        <RootStack.Screen name="PartnerMain">
          {() => (
            <Suspense
              fallback={
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              }>
              <PartnerNavigator />
            </Suspense>
          )}
        </RootStack.Screen>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
