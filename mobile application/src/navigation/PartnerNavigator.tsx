import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PartnerHomeScreen from '../screens/partner/PartnerHomeScreen';
import PartnerJobsScreen from '../screens/partner/PartnerJobsScreen';
import PartnerAccountScreen from '../screens/partner/PartnerAccountScreen';
import VerificationStatusScreen from '../screens/vendor/VerificationStatusScreen';
import BrandLogo from '../components/ui/BrandLogo';
import type {
  PartnerAccountStackParamList,
  PartnerTabParamList,
} from '../types/partnerNavigation';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<PartnerTabParamList>();
const AccountStack = createNativeStackNavigator<PartnerAccountStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surfaceDark },
  headerTitle: () => <BrandLogo size="small" />,
  headerTitleAlign: 'center' as const,
  headerTintColor: colors.primary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: colors.backgroundSoft },
};

const TAB_ICONS: Record<
  keyof PartnerTabParamList,
  { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }
> = {
  PartnerHome: { focused: 'speedometer', default: 'speedometer-outline' },
  PartnerJobs: { focused: 'navigate', default: 'navigate-outline' },
  PartnerAccount: { focused: 'person', default: 'person-outline' },
};

function TabIcon({
  routeName,
  focused,
}: {
  routeName: keyof PartnerTabParamList;
  focused: boolean;
}) {
  const icons = TAB_ICONS[routeName];
  return (
    <View style={[tabIconStyles.wrap, focused && tabIconStyles.active]}>
      <Ionicons
        name={focused ? icons.focused : icons.default}
        size={20}
        color={focused ? colors.primary : colors.text}
      />
    </View>
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
        name="VendorVerificationStatus"
        component={VerificationStatusScreen}
        options={{
          headerTitle: 'Verification Status',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
    </AccountStack.Navigator>
  );
}

export default function PartnerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surfaceDark,
          borderTopColor: colors.surfaceDarker,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.semibold,
        },
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
      })}>
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

const tabIconStyles = StyleSheet.create({
  wrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.surfaceDarker,
  },
});
