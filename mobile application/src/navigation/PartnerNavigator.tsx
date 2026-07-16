import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StackBackButton from '../components/navigation/StackBackButton';
import PartnerTabBar from '../components/partner/PartnerTabBar';
import { useAppSelector } from '../redux/hooks';
import PartnerHomeScreen from '../screens/partner/PartnerHomeScreen';
import PartnerJobsScreen from '../screens/partner/PartnerJobsScreen';
import PartnerActiveJobScreen from '../screens/partner/PartnerActiveJobScreen';
import PartnerAccountScreen from '../screens/partner/PartnerAccountScreen';
import PartnerVerificationStatusScreen from '../screens/partner/PartnerVerificationStatusScreen';
import VendorDriversScreen from '../screens/partner/VendorDriversScreen';
import type {
  PartnerAccountStackParamList,
  PartnerJobsStackParamList,
  PartnerTabParamList,
} from '../types/partnerNavigation';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<PartnerTabParamList>();
const AccountStack = createNativeStackNavigator<PartnerAccountStackParamList>();
const JobsStack = createNativeStackNavigator<PartnerJobsStackParamList>();

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
  headerBackVisible: false,
  headerLeft: (props: Parameters<typeof StackBackButton>[0]) => <StackBackButton {...props} />,
  contentStyle: { backgroundColor: colors.background },
};

function PartnerJobsStackNavigator() {
  return (
    <JobsStack.Navigator screenOptions={stackScreenOptions}>
      <JobsStack.Screen
        name="PartnerJobsList"
        component={PartnerJobsScreen}
        options={{ headerShown: false }}
      />
      <JobsStack.Screen
        name="PartnerActiveJob"
        component={PartnerActiveJobScreen}
        options={{ headerTitle: 'Active job' }}
      />
    </JobsStack.Navigator>
  );
}

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
        component={PartnerVerificationStatusScreen}
        options={{ headerShown: false }}
      />
    </AccountStack.Navigator>
  );
}

export default function PartnerNavigator() {
  const user = useAppSelector(state => state.auth.user);
  const isPartner = user?.role === 'driver' || user?.role === 'vendor';

  return (
    <Tab.Navigator
      tabBar={props => <PartnerTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="PartnerHome" component={PartnerHomeScreen} options={{ title: 'Dashboard' }} />
      {isPartner ? (
        <Tab.Screen
          name="PartnerJobs"
          component={PartnerJobsStackNavigator}
          options={{ title: 'Jobs' }}
        />
      ) : null}
      <Tab.Screen
        name="PartnerAccount"
        component={PartnerAccountStackNavigator}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}
