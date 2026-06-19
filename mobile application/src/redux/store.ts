import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';

import authReducer from './auth/authSlice';
import bookingsReducer from './bookings/bookingsSlice';
import onboardingReducer from './onboarding/onboardingSlice';
import profileReducer from './profile/profileSlice';
import subscriptionsReducer from './subscriptions/subscriptionsSlice';
import vendorOnboardingReducer from './vendor/vendorOnboardingSlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated', 'onboardingRequired', 'useCustomerExperience'],
};

const onboardingPersistConfig = {
  key: 'onboarding',
  storage: AsyncStorage,
  whitelist: ['vehicleOnboardingRequired', 'profileDraft', 'currentStep', 'signupAccountType', 'signupVendorType', 'partnerSignupRequired', 'introSlidesCompleted'],
};

const bookingsPersistConfig = {
  key: 'bookings',
  storage: AsyncStorage,
  whitelist: ['items', 'activeBookingId'],
};

const profilePersistConfig = {
  key: 'profile',
  storage: AsyncStorage,
  whitelist: ['savedLocations', 'paymentMethods', 'wallet', 'notificationPreferences', 'settings', 'subscription'],
};

const vendorOnboardingPersistConfig = {
  key: 'vendorOnboarding',
  storage: AsyncStorage,
  whitelist: ['activeVendorType', 'currentStep', 'draft'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  onboarding: persistReducer(onboardingPersistConfig, onboardingReducer),
  bookings: persistReducer(bookingsPersistConfig, bookingsReducer),
  profile: persistReducer(profilePersistConfig, profileReducer),
  subscriptions: subscriptionsReducer,
  vendorOnboarding: persistReducer(vendorOnboardingPersistConfig, vendorOnboardingReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
