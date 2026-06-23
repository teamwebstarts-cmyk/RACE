import { toISODate, startOfDay } from '../utils/driverCalendar';

export type DriverTypeId = 'part_time' | 'full_time' | 'outstation' | 'night';
export type DriverDurationId = '2' | '4' | '8' | 'custom';

export interface DriverBookingState {
  driverType: DriverTypeId;
  dateId: string;
  durationId: DriverDurationId;
  startTime: string;
  pickup: string;
  bookingId: string;
}

export const DEFAULT_DRIVER_BOOKING: DriverBookingState = {
  driverType: 'part_time',
  dateId: toISODate(startOfDay(new Date())),
  durationId: '8',
  startTime: '09:00',
  pickup: 'Patia Square, Bhubaneswar',
  bookingId: '#RACE45821',
};
