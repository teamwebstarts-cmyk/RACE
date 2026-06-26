import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MobileNumberScreen from '../screens/auth/MobileNumberScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ProfileCompletionScreen from '../screens/auth/ProfileCompletionScreen';
import { useAppSelector } from '../redux/hooks';
import type { AuthStackParamList } from '../types/navigation';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const onboardingRequired = useAppSelector((state) => state.auth.onboardingRequired);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);

  const initialRouteName =
    accessToken && onboardingRequired && !user?.isProfileCompleted
      ? 'ProfileCompletion'
      : 'MobileNumber';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surfaceDarker },
      }}>
      <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} />
    </Stack.Navigator>
  );
}
