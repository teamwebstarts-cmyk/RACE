import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PartnerLoginScreen from '../screens/partner/auth/PartnerLoginScreen';
import PartnerOtpVerificationScreen from '../screens/partner/auth/PartnerOtpVerificationScreen';
import PartnerRoleSelectionScreen from '../screens/partner/auth/PartnerRoleSelectionScreen';
import PartnerSplashScreen from '../screens/partner/auth/PartnerSplashScreen';
import PartnerWelcomeScreen from '../screens/partner/auth/PartnerWelcomeScreen';
import type { PartnerAuthStackParamList } from '../types/partnerNavigation';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<PartnerAuthStackParamList>();

export default function PartnerAuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PartnerSplash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}>
      <Stack.Screen name="PartnerSplash" component={PartnerSplashScreen} />
      <Stack.Screen name="PartnerWelcome" component={PartnerWelcomeScreen} />
      <Stack.Screen name="PartnerRoleSelection" component={PartnerRoleSelectionScreen} />
      <Stack.Screen name="PartnerLogin" component={PartnerLoginScreen} />
      <Stack.Screen name="PartnerOtpVerification" component={PartnerOtpVerificationScreen} />
    </Stack.Navigator>
  );
}
