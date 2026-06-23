export type TowingServiceModeId = 'instant' | 'scheduled' | 'emergency';

export type TowingVehicleTypeId = 'hatchback' | 'sedan' | 'suv' | 'bike';
export type TowingTypeId = 'flatbed' | 'wheel_lift';
export type TowingTimeId = 'asap' | '30-60' | '60-90' | 'custom';

export interface TowingBookingState {
  serviceMode: TowingServiceModeId;
  vehicleType: TowingVehicleTypeId;
  pickup: string;
  drop: string;
  towingType: TowingTypeId;
  dateId: string;
  timeId: TowingTimeId;
  bookingId: string;
}

export const DEFAULT_TOWING_BOOKING: TowingBookingState = {
  serviceMode: 'instant',
  vehicleType: 'sedan',
  pickup: 'Patia Square, Bhubaneswar',
  drop: 'Cuttack Road, Bhubaneswar',
  towingType: 'flatbed',
  dateId: 'today',
  timeId: 'asap',
  bookingId: '#RACE78291',
};
