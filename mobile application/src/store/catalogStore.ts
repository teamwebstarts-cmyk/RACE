import { create } from 'zustand';

import * as catalogService from '../services/catalogService';
import { getApiErrorMessage } from '../services/api';
import type { Brand, ServiceCategory } from '../types/models';

interface CatalogState {
  services: ServiceCategory[];
  brand: Brand | null;
  isLoading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  fetchBrand: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  services: [],
  brand: null,
  isLoading: false,
  error: null,

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const services = await catalogService.getServices();
      set({ services, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to load services'),
      });
      throw error;
    }
  },

  fetchBrand: async () => {
    set({ isLoading: true, error: null });
    try {
      const brand = await catalogService.getBrand();
      set({ brand, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to load brand'),
      });
      throw error;
    }
  },
}));
