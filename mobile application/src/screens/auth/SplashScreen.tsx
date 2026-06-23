import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StatusBar,
  type LayoutChangeEvent,
} from 'react-native';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';
import { images } from '../../assets';

const REF_W = 484;
const REF_H = 1024;

const BTN_H = 66;
const BTN_SIDE = 67;
const BTN1_BOTTOM = 90;
const BTN2_BOTTOM = 22;

type SplashNav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

type SplashScreenProps = {
  onGetStarted?: () => void;
  onLogin?: () => void;
};

function SplashScreen({ onGetStarted, onLogin }: SplashScreenProps) {
  const navigation = useNavigation<SplashNav>();
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const [layout, setLayout] = useState({ w: winW, h: winH });

  useEffect(() => {
    void Asset.fromModule(images.onboarding1).downloadAsync();
    void Asset.fromModule(images.onboarding2).downloadAsync();
    void Asset.fromModule(images.onboarding3).downloadAsync();
    void Asset.fromModule(images.onboarding4).downloadAsync();
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setLayout({ w: width, h: height });
    }
  };

  const w = layout.w;
  const h = layout.h;
  const scaleX = w / REF_W;
  const scaleY = h / REF_H;

  const btnH = BTN_H * scaleY;
  const btnW = (REF_W - BTN_SIDE * 2) * scaleX;
  const btnLeft = BTN_SIDE * scaleX;

  const safeLift = Math.max(0, insets.bottom - BTN2_BOTTOM * scaleY);
  const btn2Bottom = BTN2_BOTTOM * scaleY + safeLift;
  const btn1Bottom = BTN1_BOTTOM * scaleY + safeLift;

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
      return;
    }
    navigation.navigate('Onboarding');
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <View style={styles.root} onLayout={onLayout}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <Image
        source={images.splashContent}
        style={{ position: 'absolute', top: 0, left: 0, width: w, height: h }}
        resizeMode="stretch"
        resizeMethod="scale"
        fadeDuration={0}
      />

      <Image
        source={images.onboarding1}
        style={styles.preload}
        resizeMode="stretch"
        resizeMethod="scale"
        fadeDuration={0}
      />

      <Image
        source={images.onboarding2}
        style={styles.preload}
        resizeMode="stretch"
        resizeMethod="scale"
        fadeDuration={0}
      />

      <Image
        source={images.onboarding3}
        style={styles.preload}
        resizeMode="stretch"
        resizeMethod="scale"
        fadeDuration={0}
      />

      <Image
        source={images.onboarding4}
        style={styles.preload}
        resizeMode="stretch"
        resizeMethod="scale"
        fadeDuration={0}
      />

      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          zIndex: 10,
          bottom: btn1Bottom,
          left: btnLeft,
          width: btnW,
          height: btnH,
        }}
        onPress={handleGetStarted}
      />

      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          zIndex: 10,
          bottom: btn2Bottom,
          left: btnLeft,
          width: btnW,
          height: btnH,
        }}
        onPress={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  preload: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    left: -9999,
  },
});

export default SplashScreen;
