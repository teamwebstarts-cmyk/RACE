export type AuthStackParamList = {
  MobileNumber: undefined;
  OtpVerification: { mobileNumber: string; devOtp?: string; isExistingUser?: boolean };
  ProfileWizard: undefined;
  AddFirstVehicle: undefined;
  VehicleSuccess: { vehicleId: string; vehicleNumber: string };
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
  VendorTypeSelect: undefined;
  VendorWizard: { vendorType: import('./vendor').VendorType };
  VendorReview: { vendorType: import('./vendor').VendorType };
  VendorVerificationStatus: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
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
  VendorVerificationStatus: undefined;
};
