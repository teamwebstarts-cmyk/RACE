import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';

import { images } from './src/assets';
import AppNavigator from './src/navigation/AppNavigator';
import { SosDetailsProvider } from './src/context/SosDetailsContext';
import { queryClient } from './src/services/queryClient';
import { store } from './src/redux/store';
import { useAuth } from './src/hooks/useAuth';
import { colors } from './src/theme';

function AppRoot() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Image
          source={images.splashContent}
          style={StyleSheet.absoluteFill}
          resizeMode="stretch"
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <SosDetailsProvider>
            <AppRoot />
          </SosDetailsProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
