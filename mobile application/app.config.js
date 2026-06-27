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
      softwareKeyboardLayoutMode: 'resize',
      adaptiveIcon: {
        foregroundImage: './src/assets/images/logo.png',
        backgroundColor: '#232323',
      },
    },
    scheme: 'race-customer',
    plugins: [
      'expo-asset',
      'expo-font',
      'expo-secure-store',
      '@react-native-community/datetimepicker',
    ],
  },
};
