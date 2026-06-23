import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BookingPaymentFlow } from '../constants/bookingPayment';

export type BookingPaymentParams = {
  amount: number;
  flow: BookingPaymentFlow;
};

export type TowingBookingParamList = {
  TowingService: undefined;
  TowingChooseVehicle: undefined;
  TowingPickupDrop: undefined;
  TowingSelectType: undefined;
  TowingDateTime: undefined;
  TowingReview: undefined;
  BookingPayment: BookingPaymentParams;
  TowingConfirmed: undefined;
  TowingTrack: { fromBookings?: boolean } | undefined;
  TowingDriverOnWay: undefined;
  TowingCompleted: undefined;
  TowingRate: undefined;
};

export type DriverBookingParamList = {
  DriverService: undefined;
  DriverSelectType: undefined;
  DriverDateTime: undefined;
  DriverPickup: undefined;
  DriverReview: undefined;
  BookingPayment: BookingPaymentParams;
  DriverAssigned: undefined;
};

export type RoadsideBookingParamList = {
  RoadsideAssistance: undefined;
  RoadsideSelectService: undefined;
  RoadsideLocation: undefined;
  RoadsideReview: undefined;
  BookingPayment: BookingPaymentParams;
  RoadsideHelpOnWay: undefined;
};

export type MoreServicesParamList = {
  MoreServices: undefined;
};

export type ComingSoonParamList = {
  ServiceComingSoon: {
    serviceId: 'emergency_repair' | 'vehicle_recovery';
  };
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  CreateAccount: undefined;
  OTP: undefined;
  ForgotPassword: undefined;
  ResetPassword: { phone: string };
  ProfileSetup: undefined;
  VehicleRegistration: undefined;
  QRCode: undefined;
  CreatePin: undefined;
};

export type BookingsStackParamList = {
  BookingsMain: undefined;
  BookingDetail: { bookingId: string };
  TowingTrack: { fromBookings?: boolean } | undefined;
  TowingRate: undefined;
};

export type CallStackParamList = {
  CallMain: undefined;
  QRScan: undefined;
  SOSEmergency: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ServiceList: {
    categoryId: string;
    categoryTitle: string;
  };
  SelectService: {
    categoryId: string;
    serviceId: string;
    serviceLabel: string;
    serviceDescription?: string;
  };
} & TowingBookingParamList & DriverBookingParamList & RoadsideBookingParamList & MoreServicesParamList & ComingSoonParamList;

export type ServicesStackParamList = {
  ServicesMain: undefined;
  ServiceList: {
    categoryId: string;
    categoryTitle: string;
  };
  SelectService: {
    categoryId: string;
    serviceId: string;
    serviceLabel: string;
    serviceDescription?: string;
  };
} & TowingBookingParamList & DriverBookingParamList & RoadsideBookingParamList & MoreServicesParamList & ComingSoonParamList;

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PersonalInformation: undefined;
  MyVehicles: undefined;
  SavedLocations: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
  Settings: undefined;
  ChoosePlan: undefined;
  CreatePin: undefined;
  ChangePassword: undefined;
  ChangeMobileNumber: undefined;
};

export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Services: NavigatorScreenParams<ServicesStackParamList> | undefined;
  Call: NavigatorScreenParams<CallStackParamList> | undefined;
  Bookings: NavigatorScreenParams<BookingsStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
