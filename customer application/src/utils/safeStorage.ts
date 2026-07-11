import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

const memoryStorage = new Map<string, string>();

/**
 * AsyncStorage wrapper that falls back to in-memory storage when the native
 * module is unavailable (e.g. Expo web, dev client without rebuild).
 */
export function createSafeStorage(): StateStorage {
  return {
    getItem: async name => {
      try {
        const value = await AsyncStorage.getItem(name);
        if (value !== null) return value;
      } catch {
        // Native module missing — use memory fallback below.
      }
      return memoryStorage.get(name) ?? null;
    },
    setItem: async (name, value) => {
      memoryStorage.set(name, value);
      try {
        await AsyncStorage.setItem(name, value);
      } catch {
        // Persisted in memory only.
      }
    },
    removeItem: async name => {
      memoryStorage.delete(name);
      try {
        await AsyncStorage.removeItem(name);
      } catch {
        // Memory cleared above.
      }
    },
  };
}
