import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import BookingFlowScreen from '../screens/booking/BookingFlowScreen';
import BookingsScreen from '../screens/booking/BookingsScreen';
import LiveTrackingScreen from '../screens/booking/LiveTrackingScreen';
import RatingReviewScreen from '../screens/booking/RatingReviewScreen';
import HomeScreen from '../screens/HomeScreen';
import SelectLocationScreen from '../screens/home/SelectLocationScreen';
import MoreServicesScreen from '../screens/MoreServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EmergencySosScreen from '../screens/profile/EmergencySosScreen';
import MyQrScreen from '../screens/profile/MyQrScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import SavedLocationsScreen from '../screens/profile/SavedLocationsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import SubscriptionPlansScreen from '../screens/profile/SubscriptionPlansScreen';
import SupportCenterScreen from '../screens/profile/SupportCenterScreen';
import SelectServiceScreen from '../screens/SelectServiceScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import VendorTypeSelectScreen from '../screens/vendor/VendorTypeSelectScreen';
import VendorWizardScreen from '../screens/vendor/VendorWizardScreen';
import ReviewSubmissionScreen from '../screens/vendor/ReviewSubmissionScreen';
import VerificationStatusScreen from '../screens/vendor/VerificationStatusScreen';
import AddVehicleScreen from '../screens/vehicles/AddVehicleScreen';
import VehicleDetailScreen from '../screens/vehicles/VehicleDetailScreen';
import VehicleQrEmergencyScreen from '../screens/vehicles/VehicleQrEmergencyScreen';
import VehicleListScreen from '../screens/vehicles/VehicleListScreen';
import BrandLogo from '../components/ui/BrandLogo';
import type {
  BookingsStackParamList,
  HomeStackParamList,
  ProfileStackParamList,
  RootTabParamList,
} from '../types/navigation';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
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
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen
        name="SelectLocation"
        component={SelectLocationScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <HomeStack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={({ route }) => ({
          headerTitle: route.params.categoryTitle || 'Services',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        })}
      />
      <HomeStack.Screen
        name="SelectService"
        component={SelectServiceScreen}
        options={{
          headerTitle: 'Book Service',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <HomeStack.Screen
        name="MoreServices"
        component={MoreServicesScreen}
        options={{
          headerTitle: 'More Services',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <HomeStack.Screen
        name="BookingFlow"
        component={BookingFlowScreen}
        options={{
          headerTitle: 'Book Service',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <HomeStack.Screen
        name="LiveTracking"
        component={LiveTrackingScreen}
        options={{
          headerTitle: 'Live Tracking',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <HomeStack.Screen
        name="RatingReview"
        component={RatingReviewScreen}
        options={{
          headerTitle: 'Rate Experience',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <HomeStack.Screen
        name="VehicleQrEmergency"
        component={VehicleQrEmergencyScreen}
        options={{
          headerTitle: 'Emergency QR',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
    </HomeStack.Navigator>
  );
}

function BookingsStackNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={stackScreenOptions}>
      <BookingsStack.Screen
        name="BookingsMain"
        component={BookingsScreen}
        options={{ headerShown: false }}
      />
      <BookingsStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          headerTitle: 'Booking Detail',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <BookingsStack.Screen
        name="LiveTracking"
        component={LiveTrackingScreen}
        options={{
          headerTitle: 'Live Tracking',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <BookingsStack.Screen
        name="RatingReview"
        component={RatingReviewScreen}
        options={{
          headerTitle: 'Rate Experience',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
      <BookingsStack.Screen
        name="BookingFlow"
        component={BookingFlowScreen}
        options={{
          headerTitle: 'Book Service',
          headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight },
        }}
      />
    </BookingsStack.Navigator>
  );
}

const TAB_ICONS: Partial<Record<
  keyof RootTabParamList,
  { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }
>> = {
  Home: { focused: 'home', default: 'home-outline' },
  Bookings: { focused: 'calendar', default: 'calendar-outline' },
  Profile: { focused: 'person', default: 'person-outline' },
  Services: { focused: 'grid', default: 'grid-outline' },
  Call: { focused: 'call', default: 'call-outline' },
};

function TabIcon({
  routeName,
  focused,
}: {
  routeName: keyof RootTabParamList;
  focused: boolean;
}) {
  const icons = TAB_ICONS[routeName] ?? { focused: 'ellipse', default: 'ellipse-outline' };
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
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="MyVehicles" component={VehicleListScreen} options={{ headerTitle: 'My Vehicles', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ headerTitle: 'Add Vehicle', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ headerTitle: 'Vehicle Details', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="MyQr" component={MyQrScreen} options={{ headerTitle: 'My QR Code', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="SavedLocations" component={SavedLocationsScreen} options={{ headerTitle: 'Saved Locations', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ headerTitle: 'Payment Methods', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerTitle: 'Notifications', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="SupportCenter" component={SupportCenterScreen} options={{ headerTitle: 'Support Center', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ headerTitle: 'Settings', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} options={{ headerTitle: 'Subscription Plans', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="EmergencySos" component={EmergencySosScreen} options={{ headerTitle: 'Emergency SOS', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="VendorTypeSelect" component={VendorTypeSelectScreen} options={{ headerTitle: 'Become a Partner', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="VendorWizard" component={VendorWizardScreen} options={{ headerTitle: 'Partner Registration', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="VendorReview" component={ReviewSubmissionScreen} options={{ headerTitle: 'Review Submission', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
      <ProfileStack.Screen name="VendorVerificationStatus" component={VerificationStatusScreen} options={{ headerTitle: 'Verification Status', headerTitleStyle: { fontWeight: typography.weights.bold, color: colors.textLight } }} />
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
      <Tab.Screen name="Bookings" component={BookingsStackNavigator} options={{ title: 'Bookings' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
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
