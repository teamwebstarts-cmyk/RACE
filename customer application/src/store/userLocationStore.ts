import { create } from 'zustand';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

import type { LocationResult } from '../types/location';
import { reverseGeocodeToLocation } from '../utils/googlePlaces';
import { formatLocationLabel } from '../utils/locationDisplay';

const STORAGE_KEY = 'race_user_location';

interface UserLocationState {
  location: LocationResult | null;
  isHydrated: boolean;
  isLocating: boolean;
  hydrate: () => Promise<void>;
  setLocation: (location: LocationResult) => Promise<void>;
  fetchCurrentLocation: () => Promise<LocationResult | null>;
  getDisplayLabel: (fallback?: string) => string;
}

async function loadStoredLocation(): Promise<LocationResult | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocationResult;
  } catch {
    return null;
  }
}

async function persistLocation(location: LocationResult): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(location));
}

export const useUserLocationStore = create<UserLocationState>((set, get) => ({
  location: null,
  isHydrated: false,
  isLocating: false,

  hydrate: async () => {
    const stored = await loadStoredLocation();
    set({ location: stored, isHydrated: true });
  },

  setLocation: async location => {
    await persistLocation(location);
    set({ location });
  },

  fetchCurrentLocation: async () => {
    set({ isLocating: true });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const location = await reverseGeocodeToLocation(
        position.coords.latitude,
        position.coords.longitude,
      );
      await persistLocation(location);
      set({ location });
      return location;
    } catch {
      return null;
    } finally {
      set({ isLocating: false });
    }
  },

  getDisplayLabel: fallback => {
    const { location } = get();
    if (location) {
      return formatLocationLabel(location);
    }
    return fallback ?? 'Select location';
  },
}));
