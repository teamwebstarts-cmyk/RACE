import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';
import { images } from '../../assets';
import { colors, layout, radius, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const REF_W = 390;
const HERO_W = 800;
const HERO_H = 886;

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  image?: ImageSourcePropType;
  heroBg?: string;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    image: images.onboarding1,
    heroBg: '#DCE7F1',
    title: '24/7 Roadside\nAssistance',
    subtitle: 'Fast, reliable and professional help\nwhen you need it most.',
  },
  {
    id: '2',
    image: images.onboarding2,
    heroBg: '#FEFDFD',
    title: 'Trusted & Verified\nExperts',
    subtitle: 'Our professionals are verified, trained\nand ready to assist.',
  },
  {
    id: '3',
    image: images.onboarding3,
    heroBg: '#FEFDFD',
    title: 'Quick Response\nNear You',
    subtitle: 'We reach you quickly with our\nnearby service network.',
  },
  {
    id: '4',
    image: images.onboarding4,
    heroBg: '#FEFDFD',
    title: '24/7 Support Always\nAvailable',
    subtitle: "We're here for you\nanytime, anywhere.",
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const [activeIndex, setActiveIndex] = useState(0);
  const slide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;

  const heroH = Math.round((width * HERO_H) / HERO_W);
  const heroTotalH = heroH + insets.top;
  const heroClipL = px(8);

  const goNext = () => {
    if (!isLast) {
      setActiveIndex(index => index + 1);
      return;
    }
    navigation.navigate('CreateAccount');
  };

  const skip = () => navigation.navigate('CreateAccount');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View style={[styles.heroWrap, { width, height: heroTotalH, backgroundColor: slide.heroBg ?? '#DCE7F1' }]}>
        {slide.image ? (
          <Image
            source={slide.image}
            style={{
              position: 'absolute',
              top: 0,
              left: -heroClipL,
              width: width + heroClipL,
              height: heroTotalH,
            }}
            resizeMode="stretch"
            resizeMethod="scale"
            fadeDuration={0}
          />
        ) : (
          <View style={styles.heroPlaceholder} />
        )}

        {!isLast ? (
          <Pressable
            onPress={skip}
            hitSlop={8}
            style={({ pressed }) => [
              styles.skipBtn,
              {
                top: insets.top + px(6),
                right: px(20),
                paddingHorizontal: px(14),
                paddingVertical: px(7),
                borderRadius: px(20),
              },
              pressed && styles.skipPressed,
            ]}>
            <Text style={[styles.skipText, { fontSize: px(14) }]}>Skip</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.panel, { paddingHorizontal: px(24), paddingBottom: insets.bottom + px(12) }]}>
        <View style={{ paddingTop: px(34) }}>
          <Text style={[styles.title, { fontSize: px(28), lineHeight: px(36) }]}>
            {slide.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { fontSize: px(19), lineHeight: px(28), marginTop: px(22) },
            ]}>
            {slide.subtitle}
          </Text>
        </View>

        <View>
          <View style={[styles.dots, { gap: px(8) }]}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { height: px(10), borderRadius: px(5) },
                  index === activeIndex
                    ? { width: px(10), backgroundColor: colors.primary }
                    : { width: px(10), backgroundColor: colors.border },
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={goNext}
            style={({ pressed }) => [
              styles.button,
              {
                height: px(layout.buttonHeight),
                borderRadius: px(radius.button),
                marginTop: px(14),
              },
              isLast ? styles.buttonFilled : styles.buttonOutline,
              pressed && styles.buttonPressed,
            ]}>
            <Text
              style={[
                styles.buttonLabel,
                { fontSize: px(17) },
                isLast ? styles.buttonLabelFilled : styles.buttonLabelOutline,
              ]}>
              {isLast ? "Let's Go" : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroWrap: {
    overflow: 'hidden',
    backgroundColor: '#DCE7F1',
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.lightGrey,
  },
  skipBtn: {
    position: 'absolute',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  skipPressed: {
    opacity: 0.8,
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
  },
  skipText: {
    color: colors.dark,
    fontWeight: typography.weights.bold,
  },
  panel: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: typography.weights.extrabold,
    color: colors.dark,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.grey,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {},
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFilled: {
    backgroundColor: colors.primary,
  },
  buttonOutline: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonLabel: {
    fontWeight: typography.weights.bold,
  },
  buttonLabelFilled: {
    color: colors.dark,
  },
  buttonLabelOutline: {
    color: colors.dark,
  },
});
