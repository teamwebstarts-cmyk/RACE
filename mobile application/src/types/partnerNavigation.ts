export type PartnerRole = 'vendor' | 'driver';

export type PartnerRegistrationStackParamList = {
  DriverPersonalInfo: { role: PartnerRole; mobileNumber?: string };
  DriverVehicleInfo: { role: PartnerRole; mobileNumber?: string };
  DriverDocuments: { role: PartnerRole; mobileNumber?: string };
  DriverReview: { role: PartnerRole; mobileNumber?: string };
  VendorBusinessInfo: { role: PartnerRole; mobileNumber?: string };
  VendorBusinessAddress: { role: PartnerRole; mobileNumber?: string };
  VendorDocuments: { role: PartnerRole; mobileNumber?: string };
  VendorReview: { role: PartnerRole; mobileNumber?: string };
};

export type PartnerAuthStackParamList = {
  PartnerSplash: undefined;
  PartnerWelcome: undefined;
  PartnerRoleSelection: undefined;
  PartnerLogin: { role?: PartnerRole } | undefined;
  PartnerOtpVerification: {
    mobileNumber: string;
    isExistingUser?: boolean;
  };
};

export type PartnerRootStackParamList = {
  PartnerBootstrap: undefined;
  PartnerRegistration: { role: PartnerRole; mobileNumber?: string };
  PartnerMain: undefined;
};

export type PartnerTabParamList = {
  PartnerHome: undefined;
  PartnerJobs: undefined;
  PartnerAccount: undefined;
};

export type PartnerAccountStackParamList = {
  PartnerAccountMain: undefined;
  VendorVerificationStatus: undefined;
  VendorDrivers: undefined;
};
