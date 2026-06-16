import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
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
import onboardingReducer from './onboarding/onboardingSlice';
import vendorOnboardingReducer from './vendor/vendorOnboardingSlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated', 'onboardingRequired', 'useCustomerExperience'],
};

const onboardingPersistConfig = {
  key: 'onboarding',
  storage: AsyncStorage,
  whitelist: ['vehicleOnboardingRequired', 'profileDraft', 'currentStep'],
};

const vendorOnboardingPersistConfig = {
  key: 'vendorOnboarding',
  storage: AsyncStorage,
  whitelist: ['activeVendorType', 'currentStep', 'draft'],
};

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    onboarding: persistReducer(onboardingPersistConfig, onboardingReducer),
    vendorOnboarding: persistReducer(vendorOnboardingPersistConfig, vendorOnboardingReducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
