module.exports = {
  expo: {
    name: 'RACE Service',
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
    },
    android: {
      package: 'com.racecar.customer',
      usesCleartextTraffic: true,
      adaptiveIcon: {
        foregroundImage: './src/assets/images/logo.png',
        backgroundColor: '#232323',
      },
    },
    scheme: 'race-customer',
    plugins: ['expo-asset', 'expo-font'],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.7:3000',
    },
  },
};
