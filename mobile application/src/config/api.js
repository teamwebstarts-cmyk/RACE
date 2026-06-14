import { Platform } from 'react-native';

const DEV_API_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

export const API_CONFIG = {
  baseUrl: `http://${DEV_API_HOST}:3000`,
  timeoutMs: 8000,
};

export const API_ENDPOINTS = {
  health: '/health',
  brand: '/api/v1/brand',
  services: '/api/v1/services',
};
