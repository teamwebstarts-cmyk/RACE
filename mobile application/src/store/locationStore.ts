import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSafeStorage } from '../utils/safeStorage';

import {
  findServiceableCity,
  type ServiceableCity,
} from '../config/serviceableAreas';

export interface SelectedAppLocation {
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  displayName: string;
}

interface LocationInput {
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationState {
  selectedLocation: SelectedAppLocation | null;
  isServiceable: boolean;
  serviceableCity: ServiceableCity | null;
  hasSelectedLocation: boolean;
  isHydrated: boolean;
  setLocation: (location: LocationInput) => void;
  clearLocation: () => void;
  setHydrated: (value: boolean) => void;
}

import { formatReadableAddress } from '../utils/readableAddress';

function buildDisplayName(address: string, cityName?: string): string {
  const readable = formatReadableAddress(address);
  if (cityName && !readable.toLowerCase().includes(cityName.toLowerCase())) {
    const combined = `${readable}, ${cityName}`;
    return combined.length > 48 ? readable : combined;
  }
  return readable || cityName || 'Selected location';
}

export const useLocationStore = create<LocationState>()(
  persist(
    set => ({
      selectedLocation: null,
      isServiceable: false,
      serviceableCity: null,
      hasSelectedLocation: false,
      isHydrated: false,

      setHydrated: value => set({ isHydrated: value }),

      setLocation: location => {
        const city = findServiceableCity(location.latitude, location.longitude);
        const isServiceable = city !== null && !city.comingSoon;
        const displayName = buildDisplayName(location.address, city?.displayName);

        set({
          selectedLocation: {
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            city: city?.displayName ?? '',
            displayName,
          },
          isServiceable,
          serviceableCity: city,
          hasSelectedLocation: true,
          isHydrated: true,
        });
      },

      clearLocation: () =>
        set({
          selectedLocation: null,
          isServiceable: false,
          serviceableCity: null,
          hasSelectedLocation: false,
        }),
    }),
    {
      name: 'race-location',
      storage: createJSONStorage(() => createSafeStorage()),
      partialize: state => ({
        selectedLocation: state.selectedLocation,
        isServiceable: state.isServiceable,
        serviceableCity: state.serviceableCity,
        hasSelectedLocation: state.hasSelectedLocation,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('locationStore rehydrate failed', error);
        }
        // Always mark hydrated — even if storage was empty or callback state is undefined
        useLocationStore.setState({ isHydrated: true });
      },
    },
  ),
);
