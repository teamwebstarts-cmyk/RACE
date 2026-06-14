import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import SelectServiceScreen from '../screens/SelectServiceScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import BrandLogo from '../components/ui/BrandLogo';
import { brand, colors, typography } from '../theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surfaceDark },
  headerTitle: () => <BrandLogo size="small" />,
  headerTitleAlign: 'center',
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
          headerTitle: route.params?.categoryTitle || 'Services',
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

function TabIcon({ label, focused }) {
  const icons = {
    Home: '🏠',
    Bookings: '📋',
    Profile: '👤',
  };

  return (
    <View style={[tabIconStyles.wrap, focused && tabIconStyles.active]}>
      <Text style={tabIconStyles.icon}>{icons[label]}</Text>
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
    backgroundColor: colors.surfaceDark,
  },
  icon: {
    fontSize: 16,
  },
});

const navigationTheme = {
  dark: true,
  colors: {
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
            <TabIcon label={route.name} focused={focused} />
          ),
        })}>
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{ title: brand.productName }}
        />
        <Tab.Screen
          name="Bookings"
          children={() => (
            <PlaceholderScreen
              title="Bookings"
              subtitle="Your booking history will appear here."
            />
          )}
        />
        <Tab.Screen
          name="Profile"
          children={() => (
            <PlaceholderScreen
              title="Profile"
              subtitle="Account settings and profile details will appear here."
            />
          )}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
