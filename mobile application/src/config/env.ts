import Constants from 'expo-constants';
import { Platform } from 'react-native';

function hostFromExpoDevServer(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri;

  if (!debuggerHost) {
    return null;
  }

  const host = debuggerHost.replace(/^exp:\/\//, '').split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  return host;
}

function resolveApiBaseUrl(): string {
  // Physical device + Expo Go: use the same LAN IP as Metro (no manual .env updates).
  if (__DEV__) {
    const devHost = hostFromExpoDevServer();
    if (devHost) {
      return `http://${devHost}:3000`;
    }
  }

  const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (envUrl) {
    return envUrl;
  }

  if (__DEV__ && Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
} as const;

if (__DEV__) {
  console.log('[RACE] API_BASE_URL =', API_BASE_URL);
}
