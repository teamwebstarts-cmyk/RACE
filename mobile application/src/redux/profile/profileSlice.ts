import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  AppNotification,
  AppSettings,
  NotificationPreference,
  PaymentMethod,
  SavedLocation,
  UserSubscription,
  WalletBalance,
} from '../../types/profile';

export interface ProfileState {
  savedLocations: SavedLocation[];
  paymentMethods: PaymentMethod[];
  wallet: WalletBalance;
  notificationPreferences: NotificationPreference[];
  notifications: AppNotification[];
  settings: AppSettings;
  subscription: UserSubscription;
}

const initialState: ProfileState = {
  savedLocations: [],
  paymentMethods: [],
  wallet: { balance: 0, currency: 'INR' },
  notificationPreferences: [],
  notifications: [],
  settings: {
    language: 'English',
    darkMode: true,
    pushEnabled: true,
  },
  subscription: { planId: '', status: 'none' },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setSavedLocations(state, action: PayloadAction<SavedLocation[]>) {
      state.savedLocations = action.payload;
    },
    addSavedLocation(state, action: PayloadAction<SavedLocation>) {
      state.savedLocations.push(action.payload);
    },
    updateSavedLocation(state, action: PayloadAction<SavedLocation>) {
      const index = state.savedLocations.findIndex((l) => l.id === action.payload.id);
      if (index >= 0) state.savedLocations[index] = action.payload;
    },
    removeSavedLocation(state, action: PayloadAction<string>) {
      state.savedLocations = state.savedLocations.filter((l) => l.id !== action.payload);
    },
    setPaymentMethods(state, action: PayloadAction<PaymentMethod[]>) {
      state.paymentMethods = action.payload;
    },
    setWalletBalance(state, action: PayloadAction<WalletBalance>) {
      state.wallet = action.payload;
    },
    setNotificationPreferences(state, action: PayloadAction<NotificationPreference[]>) {
      state.notificationPreferences = action.payload;
    },
    toggleNotificationPreference(state, action: PayloadAction<string>) {
      const pref = state.notificationPreferences.find((p) => p.id === action.payload);
      if (pref) pref.enabled = !pref.enabled;
    },
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.notifications = action.payload;
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const note = state.notifications.find((n) => n.id === action.payload);
      if (note) note.read = true;
    },
    updateSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      state.settings = { ...state.settings, ...action.payload };
    },
    setSubscription(state, action: PayloadAction<UserSubscription>) {
      state.subscription = action.payload;
    },
    resetProfile(state) {
      return initialState;
    },
  },
});

export const {
  setSavedLocations,
  addSavedLocation,
  updateSavedLocation,
  removeSavedLocation,
  setPaymentMethods,
  setWalletBalance,
  setNotificationPreferences,
  toggleNotificationPreference,
  setNotifications,
  markNotificationRead,
  updateSettings,
  setSubscription,
  resetProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
