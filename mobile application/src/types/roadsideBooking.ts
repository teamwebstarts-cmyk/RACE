export type RoadsideServiceId = 'flat_tyre' | 'battery' | 'fuel' | 'minor_repairs';

export interface RoadsideBookingState {
  serviceId: RoadsideServiceId;
  location: string;
  landmark: string;
  bookingId: string;
}

export const DEFAULT_ROADSIDE_BOOKING: RoadsideBookingState = {
  serviceId: 'flat_tyre',
  location: 'Patia Square, Bhubaneswar',
  landmark: '',
  bookingId: '#RACE77219',
};
