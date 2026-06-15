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
};

export type RootTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Profile: undefined;
};
