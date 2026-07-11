import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AccountTypeScreen from '../screens/auth/AccountTypeScreen';
import MobileNumberScreen from '../screens/auth/MobileNumberScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import SignupVendorTypeScreen from '../screens/auth/SignupVendorTypeScreen';
import AddFirstVehicleScreen from '../screens/onboarding/AddFirstVehicleScreen';
import ProfileWizardScreen from '../screens/onboarding/ProfileWizardScreen';
import VehicleSuccessScreen from '../screens/onboarding/VehicleSuccessScreen';
import ReviewSubmissionScreen from '../screens/vendor/ReviewSubmissionScreen';
import VendorWizardScreen from '../screens/vendor/VendorWizardScreen';
import VerificationStatusScreen from '../screens/vendor/VerificationStatusScreen';
import { useAppSelector } from '../redux/hooks';
import { isVendorRole } from '../utils/roleRouting';
import type { AuthStackParamList } from '../types/navigation';
import { colors, typography } from '../theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const onboardingRequired = useAppSelector((state) => state.auth.onboardingRequired);
  const vehicleOnboardingRequired = useAppSelector(
    (state) => state.onboarding.vehicleOnboardingRequired,
  );
  const partnerSignupRequired = useAppSelector(
    (state) => state.onboarding.partnerSignupRequired,
  );
  const signupVendorType = useAppSelector((state) => state.onboarding.signupVendorType);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);

  const initialRouteName = ((): keyof AuthStackParamList => {
    if (accessToken && partnerSignupRequired && signupVendorType && user?.isProfileCompleted) {
      return 'VendorWizard';
    }
    if (accessToken && vehicleOnboardingRequired && !isVendorRole(user) && !partnerSignupRequired) {
      return 'AddFirstVehicle';
    }
    if (accessToken && onboardingRequired && !user?.isProfileCompleted) {
      return 'ProfileWizard';
    }
    return 'AccountType';
  })();

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surfaceDarker },
      }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="AccountType" component={AccountTypeScreen} />
      <Stack.Screen name="SignupVendorType" component={SignupVendorTypeScreen} />
      <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ProfileWizard" component={ProfileWizardScreen} />
      <Stack.Screen name="AddFirstVehicle" component={AddFirstVehicleScreen} />
      <Stack.Screen name="VehicleSuccess" component={VehicleSuccessScreen} />
      <Stack.Screen
        name="VendorWizard"
        component={VendorWizardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Document Verification',
          headerStyle: { backgroundColor: colors.surfaceDark },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <Stack.Screen
        name="VendorReview"
        component={ReviewSubmissionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Review Submission',
          headerStyle: { backgroundColor: colors.surfaceDark },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <Stack.Screen
        name="VendorVerificationStatus"
        component={VerificationStatusScreen}
        options={{
          headerShown: true,
          headerTitle: 'Verification Status',
          headerStyle: { backgroundColor: colors.surfaceDark },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
    </Stack.Navigator>
  );
}
