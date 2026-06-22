import { Role } from '@race/types';
import type { LoginActivityItem, ProfileDetail } from '@race/types';

export const MOCK_PROFILE: ProfileDetail = {
  id: 'admin_1',
  name: 'Admin User',
  email: 'admin@raceservice.com',
  phone: '+91 98765 43210',
  role: Role.SUPER_ADMIN,
  department: 'Administration',
  joinedAt: '2024-01-15T08:00:00Z',
  loginActivity: [
    {
      id: 'la1',
      device: 'Chrome on Windows',
      location: 'Bhubaneswar, Odisha',
      ipAddress: '103.**.**.45',
      timestamp: '2025-06-17T10:30:00Z',
      status: 'SUCCESS',
    },
    {
      id: 'la2',
      device: 'Safari on iPhone',
      location: 'Bhubaneswar, Odisha',
      ipAddress: '103.**.**.12',
      timestamp: '2025-06-16T20:15:00Z',
      status: 'SUCCESS',
    },
    {
      id: 'la3',
      device: 'Chrome on Windows',
      location: 'Cuttack, Odisha',
      ipAddress: '49.**.**.88',
      timestamp: '2025-06-15T09:00:00Z',
      status: 'FAILED',
    },
    {
      id: 'la4',
      device: 'Firefox on macOS',
      location: 'Bhubaneswar, Odisha',
      ipAddress: '103.**.**.45',
      timestamp: '2025-06-14T14:30:00Z',
      status: 'SUCCESS',
    },
  ],
};

export function buildLoginActivity(): LoginActivityItem[] {
  return MOCK_PROFILE.loginActivity;
}
