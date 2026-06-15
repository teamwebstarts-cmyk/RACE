import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import SelectServiceScreen from '../screens/SelectServiceScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import BrandLogo from '../components/ui/BrandLogo';
import type { HomeStackParamList, RootTabParamList } from '../types/navigation';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

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

interface TabIconProps {
  routeName: keyof RootTabParamList;
  focused: boolean;
}

function TabIcon({ routeName, focused }: TabIconProps) {
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

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
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
          tabBarIcon: ({ focused }) => (
            <TabIcon routeName={route.name} focused={focused} />
          ),
        })}>
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{ title: 'Home' }}
        />
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
        <Tab.Screen
          name="Profile"
          children={() => (
            <PlaceholderScreen
              title="My Profile"
              subtitle="Sign in to manage your account, saved vehicles, and booking history."
              actionLabel="Call Support"
            />
          )}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
