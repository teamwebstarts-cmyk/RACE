import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Onboarding: undefined;
  AccountType: undefined;
  SignupVendorType: { accountType: 'vendor' | 'driver' };
  MobileNumber: undefined;
  OtpVerification: { mobileNumber: string; devOtp?: string; isExistingUser?: boolean };
  ProfileWizard: undefined;
  AddFirstVehicle: undefined;
  VehicleSuccess: { vehicleId: string; vehicleNumber: string };
  VendorWizard: { vendorType: import('./vendor').VendorType };
  VendorReview: { vendorType: import('./vendor').VendorType };
  VendorVerificationStatus: { fromSignup?: boolean };
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
  VehicleQrEmergency: { vehicleId: string };
  MoreServices: undefined;
  BookingFlow: {
    categoryId: string;
    serviceId: string;
    serviceLabel: string;
    serviceDescription?: string;
  };
  LiveTracking: { bookingId: string };
  RatingReview: { bookingId: string };
};

export type BookingsStackParamList = {
  BookingsMain: undefined;
  BookingDetail: { bookingId: string };
  LiveTracking: { bookingId: string };
  RatingReview: { bookingId: string };
  BookingFlow: {
    categoryId: string;
    serviceId: string;
    serviceLabel: string;
    serviceDescription?: string;
  };
};

export type RootTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  MyVehicles: undefined;
  AddVehicle: undefined;
  VehicleDetail: { vehicleId: string };
  MyQr: { vehicleId: string };
  SavedLocations: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  SupportCenter: undefined;
  Settings: undefined;
  SubscriptionPlans: undefined;
  EmergencySos: undefined;
  VendorTypeSelect: undefined;
  VendorWizard: { vendorType: import('./vendor').VendorType };
  VendorReview: { vendorType: import('./vendor').VendorType };
  VendorVerificationStatus: { fromSignup?: boolean } | undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: undefined;
  Partner: undefined;
};

export type PartnerTabParamList = {
  PartnerHome: undefined;
  PartnerJobs: undefined;
  PartnerAccount: undefined;
};

export type PartnerAccountStackParamList = {
  PartnerAccountMain: undefined;
  VendorVerificationStatus: { fromSignup?: boolean } | undefined;
};

/** Shared vendor wizard screens used in auth + profile stacks */
export type VendorFlowParamList = {
  VendorWizard: { vendorType: import('./vendor').VendorType };
  VendorReview: { vendorType: import('./vendor').VendorType };
  VendorVerificationStatus: { fromSignup?: boolean } | undefined;
};
