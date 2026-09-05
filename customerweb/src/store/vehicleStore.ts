import { create } from 'zustand';

import * as vehicleService from '../services/vehicleService';
import { getApiErrorMessage } from '../services/api';
import type { Vehicle, VehicleInput } from '../types/models';

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  fetchVehicles: () => Promise<void>;
  fetchVehicle: (id: string) => Promise<void>;
  addVehicle: (data: VehicleInput) => Promise<Vehicle>;
  updateVehicle: (id: string, data: Partial<VehicleInput>) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  clearVehicles: () => void;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  selectedVehicle: null,
  isLoading: false,
  error: null,

  fetchVehicles: async () => {
    set({ isLoading: true, error: null });
    try {
      const vehicles = await vehicleService.getVehicles();
      set({ vehicles, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to load vehicles'),
      });
      throw error;
    }
  },

  fetchVehicle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const vehicle = await vehicleService.getVehicle(id);
      set({ selectedVehicle: vehicle, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to load vehicle'),
      });
      throw error;
    }
  },

  addVehicle: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const vehicle = await vehicleService.addVehicle(data);
      set((state) => ({
        vehicles: [vehicle, ...state.vehicles],
        isLoading: false,
      }));
      return vehicle;
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to add vehicle'),
      });
      throw error;
    }
  },

  updateVehicle: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const vehicle = await vehicleService.updateVehicle(id, data);
      set((state) => ({
        vehicles: state.vehicles.map((item) => (item.id === id ? vehicle : item)),
        selectedVehicle:
          state.selectedVehicle?.id === id ? vehicle : state.selectedVehicle,
        isLoading: false,
      }));
      return vehicle;
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to update vehicle'),
      });
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await vehicleService.deleteVehicle(id);
      set((state) => ({
        vehicles: state.vehicles.filter((item) => item.id !== id),
        selectedVehicle:
          state.selectedVehicle?.id === id ? null : state.selectedVehicle,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to delete vehicle'),
      });
      throw error;
    }
  },

  clearVehicles: () => set({ vehicles: [], selectedVehicle: null, error: null }),
}));
