export type RoadsideServiceId = 'flat_tyre' | 'battery' | 'fuel' | 'minor_repairs';

export interface RoadsideBookingState {
  serviceId: RoadsideServiceId;
  location: string;
  locationLabel?: string;
  locationLat?: number;
  locationLng?: number;
  dropoff?: string;
  dropoffLabel?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  landmark: string;
  bookingId: string;
}

export const DEFAULT_ROADSIDE_BOOKING: RoadsideBookingState = {
  serviceId: 'flat_tyre',
  location: '',
  landmark: '',
  bookingId: '#RACE77219',
};
