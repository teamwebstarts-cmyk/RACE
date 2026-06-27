import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomTabBar from '../components/navigation/CustomTabBar';
import StackBackButton from '../components/navigation/StackBackButton';
import { DriverBookingProvider } from '../context/DriverBookingContext';
import { RoadsideBookingProvider } from '../context/RoadsideBookingContext';
import { TowingBookingProvider } from '../context/TowingBookingContext';
import { useAuth } from '../hooks/useAuth';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import CreatePinAuthScreen from '../screens/auth/CreatePinScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import TowingServiceScreen from '../screens/TowingServiceScreen';
import TowingChooseVehicleScreen from '../screens/booking/towing/TowingChooseVehicleScreen';
import TowingConfirmedScreen from '../screens/booking/towing/TowingConfirmedScreen';
import TowingCompletedScreen from '../screens/booking/towing/TowingCompletedScreen';
import TowingDateTimeScreen from '../screens/booking/towing/TowingDateTimeScreen';
import TowingDriverOnWayScreen from '../screens/booking/towing/TowingDriverOnWayScreen';
import TowingPickupDropScreen from '../screens/booking/towing/TowingPickupDropScreen';
import TowingRateScreen from '../screens/booking/towing/TowingRateScreen';
import TowingReviewScreen from '../screens/booking/towing/TowingReviewScreen';
import TowingSelectTypeScreen from '../screens/booking/towing/TowingSelectTypeScreen';
import TowingTrackScreen from '../screens/booking/towing/TowingTrackScreen';
import DriverServiceScreen from '../screens/DriverServiceScreen';
import DriverAssignedScreen from '../screens/booking/driver/DriverAssignedScreen';
import DriverDateTimeScreen from '../screens/booking/driver/DriverDateTimeScreen';
import DriverPickupScreen from '../screens/booking/driver/DriverPickupScreen';
import DriverReviewScreen from '../screens/booking/driver/DriverReviewScreen';
import DriverSelectTypeScreen from '../screens/booking/driver/DriverSelectTypeScreen';
import RoadsideAssistanceScreen from '../screens/RoadsideAssistanceScreen';
import RoadsideHelpOnWayScreen from '../screens/booking/roadside/RoadsideHelpOnWayScreen';
import RoadsideLocationScreen from '../screens/booking/roadside/RoadsideLocationScreen';
import RoadsideReviewScreen from '../screens/booking/roadside/RoadsideReviewScreen';
import RoadsideSelectServiceScreen from '../screens/booking/roadside/RoadsideSelectServiceScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import QRCodeScreen from '../screens/onboarding/QRCodeScreen';
import VehicleRegistrationScreen from '../screens/onboarding/VehicleRegistrationScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PersonalInformationScreen from '../screens/profile/PersonalInformationScreen';
import MyVehiclesScreen from '../screens/vehicles/VehicleListScreen';
import AddVehicleScreen from '../screens/vehicles/AddVehicleScreen';
import VehicleDetailScreen from '../screens/vehicles/VehicleDetailScreen';
import EditVehicleScreen from '../screens/vehicles/EditVehicleScreen';
import SosDetailsScreen from '../screens/profile/SosDetailsScreen';
import SavedLocationsScreen from '../screens/profile/SavedLocationsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChoosePlanScreen from '../screens/profile/ChoosePlanScreen';
import CreatePinScreen from '../screens/profile/CreatePinScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import ChangeMobileNumberScreen from '../screens/profile/ChangeMobileNumberScreen';
import BookingsScreen from '../screens/BookingsScreen';
import BookingDetailScreen from '../screens/bookings/BookingDetailScreen';
import BookingPaymentScreen from '../screens/booking/BookingPaymentScreen';
import CallScreen from '../screens/CallScreen';
import QRScanScreen from '../screens/call/QRScanScreen';
import SOSEmergencyScreen from '../screens/call/SOSEmergencyScreen';
import ServiceComingSoonScreen from '../screens/ServiceComingSoonScreen';
import SelectServiceScreen from '../screens/SelectServiceScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import ServicesScreen from '../screens/ServicesScreen';
import MoreServicesScreen from '../screens/MoreServicesScreen';
import type {
  AuthStackParamList,
  BookingsStackParamList,
  CallStackParamList,
  DriverBookingParamList,
  HomeStackParamList,
  RoadsideBookingParamList,
  RootStackParamList,
  RootTabParamList,
  ServicesStackParamList,
  ProfileStackParamList,
  TowingBookingParamList,
} from '../types/navigation';
import { colors, typography } from '../theme';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const CallStack = createNativeStackNavigator<CallStackParamList>();

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
  headerBackVisible: false,
  headerBackTitle: '',
  headerBackTitleVisible: false,
  headerBackButtonDisplayMode: 'minimal' as const,
  headerLeft: (props: Parameters<typeof StackBackButton>[0]) => <StackBackButton {...props} />,
  contentStyle: { backgroundColor: colors.background },
};

const towingBookingScreenOptions = { headerShown: false as const };

const towingBookingScreens = (
  Stack: ReturnType<typeof createNativeStackNavigator<HomeStackParamList>>,
) => (
  <>
    <Stack.Screen
      name="TowingService"
      component={TowingServiceScreen}
      options={{ headerTitle: 'Towing Service' }}
    />
    <Stack.Screen
      name="TowingChooseVehicle"
      component={TowingChooseVehicleScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingPickupDrop"
      component={TowingPickupDropScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingSelectType"
      component={TowingSelectTypeScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingDateTime"
      component={TowingDateTimeScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingReview"
      component={TowingReviewScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingConfirmed"
      component={TowingConfirmedScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingTrack"
      component={TowingTrackScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingDriverOnWay"
      component={TowingDriverOnWayScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingCompleted"
      component={TowingCompletedScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="TowingRate"
      component={TowingRateScreen}
      options={towingBookingScreenOptions}
    />
  </>
);

const driverBookingScreens = (
  Stack: ReturnType<
    typeof createNativeStackNavigator<HomeStackParamList & DriverBookingParamList>
  >,
) => (
  <>
    <Stack.Screen
      name="DriverService"
      component={DriverServiceScreen}
      options={{ headerTitle: 'Driver Service' }}
    />
    <Stack.Screen
      name="DriverSelectType"
      component={DriverSelectTypeScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="DriverDateTime"
      component={DriverDateTimeScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="DriverPickup"
      component={DriverPickupScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="DriverReview"
      component={DriverReviewScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="DriverAssigned"
      component={DriverAssignedScreen}
      options={towingBookingScreenOptions}
    />
  </>
);

const roadsideBookingScreens = (
  Stack: ReturnType<
    typeof createNativeStackNavigator<HomeStackParamList & RoadsideBookingParamList>
  >,
) => (
  <>
    <Stack.Screen
      name="RoadsideAssistance"
      component={RoadsideAssistanceScreen}
      options={{ headerTitle: 'Roadside Assistance' }}
    />
    <Stack.Screen
      name="RoadsideSelectService"
      component={RoadsideSelectServiceScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="RoadsideLocation"
      component={RoadsideLocationScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="RoadsideReview"
      component={RoadsideReviewScreen}
      options={towingBookingScreenOptions}
    />
    <Stack.Screen
      name="RoadsideHelpOnWay"
      component={RoadsideHelpOnWayScreen}
      options={towingBookingScreenOptions}
    />
  </>
);

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false, title: 'Home' }}
      />
      <HomeStack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={({ route }) => ({
          headerTitle: route.params.categoryTitle || 'Services',
        })}
      />
      <HomeStack.Screen
        name="SelectService"
        component={SelectServiceScreen}
        options={{ headerTitle: 'Book Service' }}
      />
      {towingBookingScreens(HomeStack)}
      {driverBookingScreens(HomeStack)}
      {roadsideBookingScreens(HomeStack)}
      <HomeStack.Screen
        name="BookingPayment"
        component={BookingPaymentScreen}
        options={towingBookingScreenOptions}
      />
      <HomeStack.Screen
        name="MoreServices"
        component={MoreServicesScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ServiceComingSoon"
        component={ServiceComingSoonScreen}
        options={({ route }) => ({
          headerTitle: route.params.serviceId === 'vehicle_recovery'
            ? 'Vehicle Recovery'
            : 'Emergency Repair',
        })}
      />
    </HomeStack.Navigator>
  );
}

function ServicesStackNavigator() {
  return (
    <ServicesStack.Navigator screenOptions={stackScreenOptions}>
      <ServicesStack.Screen
        name="ServicesMain"
        component={ServicesScreen}
        options={{ headerShown: false, title: 'Services' }}
      />
      <ServicesStack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={({ route }) => ({
          headerTitle: route.params.categoryTitle || 'Services',
        })}
      />
      <ServicesStack.Screen
        name="SelectService"
        component={SelectServiceScreen}
        options={{ headerTitle: 'Book Service' }}
      />
      {towingBookingScreens(
        ServicesStack as unknown as ReturnType<
          typeof createNativeStackNavigator<HomeStackParamList & TowingBookingParamList>
        >,
      )}
      {driverBookingScreens(
        ServicesStack as unknown as ReturnType<
          typeof createNativeStackNavigator<HomeStackParamList & DriverBookingParamList>
        >,
      )}
      {roadsideBookingScreens(
        ServicesStack as unknown as ReturnType<
          typeof createNativeStackNavigator<HomeStackParamList & RoadsideBookingParamList>
        >,
      )}
      <ServicesStack.Screen
        name="BookingPayment"
        component={BookingPaymentScreen}
        options={towingBookingScreenOptions}
      />
      <ServicesStack.Screen
        name="MoreServices"
        component={MoreServicesScreen}
        options={{ headerShown: false }}
      />
      <ServicesStack.Screen
        name="ServiceComingSoon"
        component={ServiceComingSoonScreen}
        options={({ route }) => ({
          headerTitle: route.params.serviceId === 'vehicle_recovery'
            ? 'Vehicle Recovery'
            : 'Emergency Repair',
        })}
      />
    </ServicesStack.Navigator>
  );
}

function BookingsStackNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingsMain" component={BookingsScreen} />
      <BookingsStack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <BookingsStack.Screen name="TowingTrack" component={TowingTrackScreen} />
      <BookingsStack.Screen name="TowingRate" component={TowingRateScreen} />
    </BookingsStack.Navigator>
  );
}

function CallStackNavigator() {
  return (
    <CallStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
      }}>
      <CallStack.Screen name="CallMain" component={CallScreen} />
      <CallStack.Screen name="QRScan" component={QRScanScreen} />
      <CallStack.Screen name="SOSEmergency" component={SOSEmergencyScreen} />
    </CallStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
      <ProfileStack.Screen name="MyVehicles" component={MyVehiclesScreen} />
      <ProfileStack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <ProfileStack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
      <ProfileStack.Screen name="EditVehicle" component={EditVehicleScreen} />
      <ProfileStack.Screen name="SosDetails" component={SosDetailsScreen} />
      <ProfileStack.Screen name="SavedLocations" component={SavedLocationsScreen} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
      <ProfileStack.Screen name="CreatePin" component={CreatePinScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStack.Screen name="ChangeMobileNumber" component={ChangeMobileNumberScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <TowingBookingProvider>
      <DriverBookingProvider>
        <RoadsideBookingProvider>
        <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Services" component={ServicesStackNavigator} />
        <Tab.Screen name="Call" component={CallStackNavigator} />
        <Tab.Screen name="Bookings" component={BookingsStackNavigator} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      </Tab.Navigator>
        </RoadsideBookingProvider>
      </DriverBookingProvider>
    </TowingBookingProvider>
  );
}

function OnboardingStackNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="ProfileSetup"
      screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <AuthStack.Screen
        name="VehicleRegistration"
        component={VehicleRegistrationScreen}
      />
      <AuthStack.Screen name="QRCode" component={QRCodeScreen} />
      <AuthStack.Screen name="CreatePin" component={CreatePinAuthScreen} />
    </AuthStack.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <AuthStack.Screen name="OTP" component={OTPScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <AuthStack.Screen
        name="VehicleRegistration"
        component={VehicleRegistrationScreen}
      />
      <AuthStack.Screen name="QRCode" component={QRCodeScreen} />
      <AuthStack.Screen name="CreatePin" component={CreatePinAuthScreen} />
    </AuthStack.Navigator>
  );
}

const navigationTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.cardBg,
    text: colors.dark,
    border: colors.border,
    notification: colors.error,
  },
};

export default function AppNavigator() {
  const { isAuthenticated, onboardingRequired } = useAuth();

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        ) : onboardingRequired ? (
          <RootStack.Screen name="Onboarding" component={OnboardingStackNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
