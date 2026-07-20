const googleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ??
  process.env.GOOGLE_MAPS_API_KEY ??
  '';

module.exports = {
  expo: {
    name: 'RACE Customer',
    slug: 'race-customer',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/images/logo.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './src/assets/images/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#232323',
    },
    ios: {
      bundleIdentifier: 'com.racecar.customer',
      supportsTablet: true,
      config: {
        googleMapsApiKey,
      },
    },
    android: {
      package: 'com.racecar.customer',
      softwareKeyboardLayoutMode: 'resize',
      adaptiveIcon: {
        foregroundImage: './src/assets/images/logo.png',
        backgroundColor: '#232323',
      },
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    scheme: 'race-customer',
    plugins: [
      'expo-asset',
      'expo-font',
      'expo-secure-store',
      '@react-native-community/datetimepicker',
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow RACE to access your photos for document upload.',
          cameraPermission: 'Allow RACE to use your camera for selfie verification.',
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Allow RACE to use your location to set pickup and dropoff.',
        },
      ],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.13:3000',
      googleMapsApiKey, 
    },
  },
};
