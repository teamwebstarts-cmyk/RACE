import { startOfDay, toISODate } from './driverCalendar';

export function parseStoredTime(value: string): string {
  const match24 = value.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return formatTime24(hours, minutes);
    }
  }

  const match12 = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = Number(match12[1]) % 12;
    const minutes = Number(match12[2]);
    if (match12[3].toUpperCase() === 'PM') {
      hours += 12;
    }
    return formatTime24(hours, minutes);
  }

  return '09:00';
}

export function formatTime24(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function parseTime24(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
}

export function generateTimeSlots(intervalMinutes = 30): string[] {
  const slots: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(formatTime24(hours, mins));
  }
  return slots;
}

export function isTimeSlotPast(dateIso: string, time24: string): boolean {
  const todayIso = toISODate(startOfDay(new Date()));
  if (dateIso !== todayIso) {
    return false;
  }

  const now = new Date();
  const { hours, minutes } = parseTime24(time24);
  const slot = new Date();
  slot.setHours(hours, minutes, 0, 0);
  return slot.getTime() <= now.getTime();
}
