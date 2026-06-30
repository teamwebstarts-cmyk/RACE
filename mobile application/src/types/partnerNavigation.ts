export type PartnerRole = 'vendor' | 'driver';

export type PartnerAuthStackParamList = {
  PartnerSplash: undefined;
  PartnerWelcome: undefined;
  PartnerRoleSelection: undefined;
  PartnerLogin: { role?: PartnerRole } | undefined;
  PartnerOtpVerification: {
    mobileNumber: string;
    devOtp?: string;
    isExistingUser?: boolean;
  };
};

export type PartnerRootStackParamList = {
  PartnerBootstrap: undefined;
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
};
