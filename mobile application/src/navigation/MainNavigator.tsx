import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SelectServiceScreen from '../screens/SelectServiceScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import AddVehicleScreen from '../screens/vehicles/AddVehicleScreen';
import VehicleDetailScreen from '../screens/vehicles/VehicleDetailScreen';
import VehicleListScreen from '../screens/vehicles/VehicleListScreen';
import BrandLogo from '../components/ui/BrandLogo';
import type { HomeStackParamList, ProfileStackParamList, RootTabParamList } from '../types/navigation';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surfaceDark },
  headerTitle: () => <BrandLogo size="small" />,
  headerTitleAlign: 'center' as const,
  headerTintColor: colors.primary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: colors.backgroundSoft },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={({ route }) => ({
          headerTitle: route.params.categoryTitle || 'Services',
          headerTitleStyle: {
            fontWeight: typography.weights.bold,
            color: colors.textLight,
          },
        })}
      />
      <HomeStack.Screen
        name="SelectService"
        component={SelectServiceScreen}
        options={{
          headerTitle: 'Book Service',
          headerTitleStyle: {
            fontWeight: typography.weights.bold,
            color: colors.textLight,
          },
        }}
      />
    </HomeStack.Navigator>
  );
}

const TAB_ICONS: Record<
  keyof RootTabParamList,
  { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }
> = {
  Home: { focused: 'home', default: 'home-outline' },
  Bookings: { focused: 'calendar', default: 'calendar-outline' },
  Profile: { focused: 'person', default: 'person-outline' },
};

function TabIcon({
  routeName,
  focused,
}: {
  routeName: keyof RootTabParamList;
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

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="MyVehicles"
        component={VehicleListScreen}
        options={{
          headerTitle: 'My Vehicles',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <ProfileStack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          headerTitle: 'Add Vehicle',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <ProfileStack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{
          headerTitle: 'Vehicle Details',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
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
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen
        name="Bookings"
        children={() => (
          <PlaceholderScreen
            title="My Bookings"
            subtitle="You have no active bookings. Call RACE Service to schedule towing, drivers, or roadside help."
            actionLabel="Call to Book"
          />
        )}
      />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
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
