import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MobileNumberScreen from '../screens/auth/MobileNumberScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import AddFirstVehicleScreen from '../screens/onboarding/AddFirstVehicleScreen';
import ProfileWizardScreen from '../screens/onboarding/ProfileWizardScreen';
import VehicleSuccessScreen from '../screens/onboarding/VehicleSuccessScreen';
import { useAppSelector } from '../redux/hooks';
import { isVendorRole } from '../utils/roleRouting';
import type { AuthStackParamList } from '../types/navigation';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const onboardingRequired = useAppSelector((state) => state.auth.onboardingRequired);
  const vehicleOnboardingRequired = useAppSelector(
    (state) => state.onboarding.vehicleOnboardingRequired,
  );
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);

  const initialRouteName = (() => {
    if (accessToken && vehicleOnboardingRequired && !isVendorRole(user)) return 'AddFirstVehicle';
    if (accessToken && onboardingRequired && !user?.isProfileCompleted) return 'ProfileWizard';
    return 'MobileNumber';
  })();

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surfaceDarker },
      }}>
      <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ProfileWizard" component={ProfileWizardScreen} />
      <Stack.Screen name="AddFirstVehicle" component={AddFirstVehicleScreen} />
      <Stack.Screen name="VehicleSuccess" component={VehicleSuccessScreen} />
    </Stack.Navigator>
  );
}
