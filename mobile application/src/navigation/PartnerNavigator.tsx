import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PartnerTabBar from '../components/partner/PartnerTabBar';
import PartnerHomeScreen from '../screens/partner/PartnerHomeScreen';
import PartnerJobsScreen from '../screens/partner/PartnerJobsScreen';
import PartnerAccountScreen from '../screens/partner/PartnerAccountScreen';
import VendorDriversScreen from '../screens/partner/VendorDriversScreen';
import VerificationStatusScreen from '../screens/vendor/VerificationStatusScreen';
import type {
  PartnerAccountStackParamList,
  PartnerTabParamList,
} from '../types/partnerNavigation';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<PartnerTabParamList>();
const AccountStack = createNativeStackNavigator<PartnerAccountStackParamList>();

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTintColor: colors.dark,
  headerTitleStyle: {
    fontSize: 17,
    fontWeight: typography.weights.bold,
    color: colors.dark,
  },
  headerTitleAlign: 'center' as const,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

function PartnerAccountStackNavigator() {
  return (
    <AccountStack.Navigator screenOptions={stackScreenOptions}>
      <AccountStack.Screen
        name="PartnerAccountMain"
        component={PartnerAccountScreen}
        options={{ headerShown: false }}
      />
      <AccountStack.Screen
        name="VendorDrivers"
        component={VendorDriversScreen}
        options={{ headerTitle: 'My Drivers' }}
      />
      <AccountStack.Screen
        name="VendorVerificationStatus"
        component={VerificationStatusScreen}
        options={{
          headerTitle: 'Verification Status',
        }}
      />
    </AccountStack.Navigator>
  );
}

export default function PartnerNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <PartnerTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="PartnerHome" component={PartnerHomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="PartnerJobs" component={PartnerJobsScreen} options={{ title: 'Jobs' }} />
      <Tab.Screen
        name="PartnerAccount"
        component={PartnerAccountStackNavigator}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}
