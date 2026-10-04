import React, { useCallback, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, Path } from 'react-native-svg';
import { MapPin, ShieldCheck, Zap } from 'lucide-react-native';

import {
  AUTH_COLORS as COLORS,
  AUTH_DESIGN_HEIGHT,
  AUTH_DESIGN_WIDTH,
} from '../../components/auth/authDesign';
import { AuthHeader } from '../../components/auth/AuthPhoneChrome';
import AuthToast from '../../components/auth/AuthToast';
import {
  GoldCta,
  InfoNote,
  OutlineCta,
  PrivacyNote,
  ProfileDropdown,
  ProfileField,
  ProfileMobileField,
  ProfileStepper,
  VehicleTypeChips,
} from '../../components/onboarding/ProfileSetupChrome';
import {
  AboutYouHero,
  AllSetHero,
  EmergencyHero,
  PROFILE_HERO_RATIO,
  VehicleHero,
} from '../../components/onboarding/ProfileSetupHeroes';
import { dismissOpenProfileDropdown } from '../../components/onboarding/profileDropdownDismiss';
import { KeyboardFormView } from '../../components/ui/AppKeyboard';
import { UI_PREVIEW_AUTH_FLOW } from '../../config/uiPreviewMode';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { completeOnboarding } from '../../redux/auth/authSlice';
import { finishVehicleOnboarding } from '../../redux/onboarding/onboardingSlice';
import type { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileWizard'>;
type SetupStep = 1 | 2 | 3 | 4;

const RELATIONSHIPS = ['Parent', 'Spouse', 'Sibling', 'Friend', 'Other'];
const CUSTOM_OPTION = 'Other';
const MAKES = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Mahindra', CUSTOM_OPTION];
const MODELS_BY_MAKE: Record<string, string[]> = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'WagonR', CUSTOM_OPTION],
  Hyundai: ['Creta', 'Venue', 'i20', CUSTOM_OPTION],
  Tata: ['Nexon', 'Punch', 'Harrier', CUSTOM_OPTION],
  Honda: ['City', 'Amaze', 'Activa', CUSTOM_OPTION],
  Mahindra: ['Scorpio', 'Thar', 'XUV700', CUSTOM_OPTION],
  [CUSTOM_OPTION]: [CUSTOM_OPTION],
};
/** Same on steps 1–3: title block + hero + card overlap */
const WIZARD_COPY_BLOCK_HEIGHT = 108;
const WIZARD_CARD_OVERLAP = 44;
const WIZARD_HERO_LIFT = 32;
const VEHICLE_TYPES = ['car', 'bike', 'auto', 'truck', 'other'] as const;

export default function ProfileWizardScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const screenWidth = Math.min(width, 430);
  const innerHeight = height - insets.top - insets.bottom;
  const scale = Math.min(screenWidth / AUTH_DESIGN_WIDTH, innerHeight / AUTH_DESIGN_HEIGHT);

  const [step, setStep] = useState<SetupStep>(1);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [registration, setRegistration] = useState('');
  const [vehicleType, setVehicleType] = useState<(typeof VEHICLE_TYPES)[number]>('car');
  const [make, setMake] = useState('Maruti Suzuki');
  const [model, setModel] = useState('Swift');
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');
  const layoutWidth = width;
  const heroBleed = (layoutWidth - screenWidth) / 2;
  const heroHeight = layoutWidth * PROFILE_HERO_RATIO;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const showStep = useCallback((next: SetupStep) => {
    Keyboard.dismiss();
    dismissOpenProfileDropdown();
    setDropdownOpen(false);
    setError('');
    setStep(next);
  }, []);

  const goBack = () => {
    if (step > 1) {
      showStep((step - 1) as SetupStep);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (step > 1) {
          showStep((step - 1) as SetupStep);
          return true;
        }
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        return true;
      });
      return () => sub.remove();
    }, [navigation, showStep, step]),
  );

  const continueFromAbout = () => {
    if (!UI_PREVIEW_AUTH_FLOW && !fullName.trim()) {
      setError('Enter your full name to continue.');
      return;
    }
    showStep(2);
  };

  const continueFromEmergency = () => {
    if (!UI_PREVIEW_AUTH_FLOW) {
      const digits = emergencyMobile.replace(/\D/g, '');
      if (!emergencyName.trim() || !/^[6-9]\d{9}$/.test(digits)) {
        setError('Enter the contact name and a 10-digit Indian mobile.');
        return;
      }
    }
    showStep(3);
  };

  const saveVehicle = () => {
    if (!UI_PREVIEW_AUTH_FLOW && !registration.trim()) {
      setError('Enter the vehicle registration number.');
      return;
    }
    showStep(4);
  };

  const finishToHome = () => {
    dispatch(finishVehicleOnboarding());
    dispatch(
      completeOnboarding(
        user
          ? {
              ...user,
              isProfileCompleted: true,
              fullName: fullName.trim() || user.fullName || 'Preview User',
              email: email.trim() || user.email,
            }
          : undefined,
      ),
    );
  };

  const stepperStep: 1 | 2 | 3 = step === 4 ? 3 : step;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" translucent={false} />
      <KeyboardFormView style={styles.fill} contentContainerStyle={{ flexGrow: 1, paddingBottom: 28 * scale }}>
        <View style={[styles.fill, { width: screenWidth, alignSelf: 'center' }]}>
          {dropdownOpen ? (
            <Pressable
              accessibilityLabel="Close menu"
              onPress={() => {
                dismissOpenProfileDropdown();
                setDropdownOpen(false);
              }}
              style={[StyleSheet.absoluteFill, { zIndex: 4 }]}
            />
          ) : null}

          <AuthHeader scale={scale} onBack={goBack} />
          {step < 4 ? <ProfileStepper scale={scale} step={stepperStep} /> : null}

          {step === 4 ? (
            <SuccessView scale={scale} screenWidth={screenWidth} onContinue={finishToHome} />
          ) : (
            <>
              <View
                style={{
                  paddingHorizontal: 24 * scale,
                  paddingTop: 18 * scale,
                  height: WIZARD_COPY_BLOCK_HEIGHT * scale,
                  zIndex: 2,
                  justifyContent: 'flex-end',
                }}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  style={{
                    color: '#111318',
                    fontSize: 28 * scale,
                    lineHeight: 36 * scale,
                    fontWeight: '800',
                    letterSpacing: -0.7 * scale,
                  }}>
                  {step === 1
                    ? "Let's get to know you"
                    : step === 2
                      ? 'Add an emergency contact'
                      : 'Set up your vehicle'}
                </Text>
                <Text
                  numberOfLines={2}
                  style={{
                    marginTop: 6 * scale,
                    minHeight: 44 * scale,
                    color: COLORS.secondary,
                    fontSize: 15 * scale,
                    lineHeight: 22 * scale,
                  }}>
                  {step === 1
                    ? 'A few details help us personalize your RACE experience.'
                    : step === 2
                      ? "We'll use this only when you need help on the road."
                      : 'Save your vehicle once and make future assistance faster.'}
                </Text>
              </View>

              <View
                style={{
                  width: layoutWidth,
                  marginLeft: -heroBleed,
                  marginTop: -WIZARD_HERO_LIFT * scale,
                  height: heroHeight,
                  overflow: 'hidden',
                }}
                pointerEvents="none">
                {step === 1 ? (
                  <AboutYouHero width={layoutWidth} />
                ) : step === 2 ? (
                  <EmergencyHero width={layoutWidth} />
                ) : (
                  <VehicleHero width={layoutWidth} />
                )}
              </View>

              <View
                style={{
                  marginHorizontal: 16 * scale,
                  marginTop: -WIZARD_CARD_OVERLAP * scale,
                  padding: 18 * scale,
                  borderRadius: 20 * scale,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#F2EEE6',
                  zIndex: 10,
                }}>
                {error ? <AuthToast message={error} type="error" /> : null}

                {step === 1 ? (
                  <>
                    <ProfileField
                      scale={scale}
                      label="Full name"
                      required
                      icon="user"
                      value={fullName}
                      placeholder="Your full name"
                      autoCapitalize="words"
                      onChangeText={value => {
                        setFullName(value);
                        setError('');
                      }}
                    />
                    <ProfileField
                      scale={scale}
                      label="Email (optional)"
                      icon="mail"
                      value={email}
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={setEmail}
                    />
                    <InfoNote scale={scale} text="You can add these later in profile settings." />
                    <GoldCta scale={scale} label="Continue" onPress={continueFromAbout} />
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <ProfileField
                      scale={scale}
                      label="Contact name"
                      required
                      icon="user"
                      value={emergencyName}
                      placeholder="Contact person name"
                      autoCapitalize="words"
                      onChangeText={value => {
                        setEmergencyName(value);
                        setError('');
                      }}
                    />
                    <ProfileMobileField
                      scale={scale}
                      label="Mobile number"
                      required
                      value={emergencyMobile}
                      placeholder="98765 43210"
                      onChangeText={value => {
                        setEmergencyMobile(value.replace(/[^\d\s]/g, ''));
                        setError('');
                      }}
                    />
                    <ProfileDropdown
                      scale={scale}
                      label="Relationship (optional)"
                      icon="heart"
                      value={relationship}
                      placeholder="Parent"
                      options={RELATIONSHIPS}
                      onSelect={setRelationship}
                      onOpenChange={setDropdownOpen}
                    />
                    <GoldCta scale={scale} label="Continue" onPress={continueFromEmergency} />
                    <OutlineCta scale={scale} label="Skip for now" onPress={() => showStep(3)} />
                    <PrivacyNote scale={scale} />
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <ProfileField
                      scale={scale}
                      label="Registration number"
                      required
                      icon="plate"
                      value={registration}
                      placeholder="OD 02 AB 1234"
                      autoCapitalize="characters"
                      onChangeText={value => {
                        setRegistration(value);
                        setError('');
                      }}
                    />
                    <VehicleTypeChips scale={scale} value={vehicleType} onChange={value => setVehicleType(value as (typeof VEHICLE_TYPES)[number])} />
                    <View style={{ flexDirection: 'row', gap: 10 * scale, zIndex: 12 }}>
                      <View style={{ flex: 1 }}>
                        <ProfileDropdown
                          scale={scale}
                          label="Make"
                          value={make}
                          placeholder="Maruti Suzuki"
                          options={MAKES}
                          onOpenChange={setDropdownOpen}
                          onSelect={value => {
                            setMake(value);
                            setModel(MODELS_BY_MAKE[value]?.[0] ?? CUSTOM_OPTION);
                            setCustomMake('');
                            setCustomModel('');
                          }}
                        />
                      </View>
                      {make !== CUSTOM_OPTION ? (
                        <View style={{ flex: 1 }}>
                          <ProfileDropdown
                            scale={scale}
                            label="Model"
                            value={model}
                            placeholder="Swift"
                            options={MODELS_BY_MAKE[make] ?? [CUSTOM_OPTION]}
                            onOpenChange={setDropdownOpen}
                            onSelect={value => {
                              setModel(value);
                              setCustomModel('');
                            }}
                          />
                        </View>
                      ) : null}
                    </View>
                    {make === CUSTOM_OPTION ? (
                      <ProfileField
                        scale={scale}
                        label="Custom make"
                        icon="plate"
                        value={customMake}
                        placeholder="Brand name"
                        autoCapitalize="words"
                        onChangeText={setCustomMake}
                      />
                    ) : null}
                    {make === CUSTOM_OPTION || model === CUSTOM_OPTION ? (
                      <ProfileField
                        scale={scale}
                        label="Custom model"
                        icon="plate"
                        value={customModel}
                        placeholder="Model name"
                        autoCapitalize="words"
                        onChangeText={setCustomModel}
                      />
                    ) : null}
                    <GoldCta scale={scale} label="Save vehicle" onPress={saveVehicle} />
                    <Text
                      numberOfLines={1}
                      style={{
                        marginTop: 10 * scale,
                        textAlign: 'center',
                        color: '#9A9A92',
                        fontSize: 13 * scale,
                      }}>
                      You can add more vehicles later.
                    </Text>
                  </>
                ) : null}
              </View>
            </>
          )}
        </View>
      </KeyboardFormView>
    </SafeAreaView>
  );
}

function SuccessView({
  scale,
  screenWidth,
  onContinue,
}: {
  scale: number;
  screenWidth: number;
  onContinue: () => void;
}) {
  const [heroHeight, setHeroHeight] = useState(screenWidth * 0.58);
  const chips: Array<{ title: string; caption: string; icon: 'bolt' | 'shield' | 'pin' }> = [
    { title: '24/7', caption: 'Assistance', icon: 'bolt' },
    { title: 'Verified', caption: 'Professionals', icon: 'shield' },
    { title: 'Quick', caption: 'Response', icon: 'pin' },
  ];
  const checkSize = 104 * scale;
  return (
    <View style={styles.fill}>
      <View style={{ paddingHorizontal: 24 * scale, paddingTop: 8 * scale }}>
        <View style={{ alignItems: 'center', height: 128 * scale, justifyContent: 'center' }}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {[
              { top: 8, left: 118, w: 7, h: 7, color: '#F3C14A', rot: 18 },
              { top: 22, left: 86, w: 5, h: 5, color: '#1FA971', rot: 0 },
              { top: 4, right: 108, w: 6, h: 6, color: '#E8B84A', rot: 28 },
              { top: 36, right: 78, w: 4, h: 10, color: '#F6D27A', rot: 40 },
              { top: 18, right: 132, w: 8, h: 3, color: '#C9EBD6', rot: -20 },
              { top: 70, left: 92, w: 6, h: 3, color: '#F3C14A', rot: 55 },
              { top: 78, right: 96, w: 5, h: 5, color: '#8ED4A8', rot: 12 },
              { top: 96, left: 128, w: 4, h: 4, color: '#E8B84A', rot: 0 },
            ].map((dot, index) => (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  top: dot.top * scale,
                  left: 'left' in dot ? (dot.left as number) * scale : undefined,
                  right: 'right' in dot ? (dot.right as number) * scale : undefined,
                  width: dot.w * scale,
                  height: dot.h * scale,
                  borderRadius: 99,
                  backgroundColor: dot.color,
                  transform: [{ rotate: `${dot.rot}deg` }],
                  opacity: 0.85,
                }}
              />
            ))}
          </View>
          <View
            style={{
              width: checkSize,
              height: checkSize,
              borderRadius: checkSize / 2,
              backgroundColor: '#E8F8EE',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Svg width={48 * scale} height={48 * scale} viewBox="0 0 24 24">
              <Path
                d="M5 12.5 L10 17.2 L19 7.8"
                fill="none"
                stroke="#1FA971"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            marginTop: 18 * scale,
            color: '#111318',
            fontSize: 32 * scale,
            lineHeight: 40 * scale,
            fontWeight: '800',
            textAlign: 'center',
          }}>
          You're all set!
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: 10 * scale,
            color: COLORS.secondary,
            fontSize: 15 * scale,
            lineHeight: 22 * scale,
            textAlign: 'center',
          }}>
          RACE is ready when you need us.
        </Text>

        <View
          style={{
            marginTop: 22 * scale,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8 * scale,
          }}>
          {chips.map(item => (
            <View
              key={item.title}
              style={{
                flex: 1,
                paddingVertical: 16 * scale,
                borderRadius: 16 * scale,
                backgroundColor: '#F3EFE4',
                alignItems: 'center',
              }}>
              <SuccessChipIcon type={item.icon} size={36 * scale} />
              <Text
                style={{
                  marginTop: 8 * scale,
                  color: '#0B0C10',
                  fontSize: 13 * scale,
                  fontWeight: '800',
                }}>
                {item.title}
              </Text>
              <Text style={{ marginTop: 3 * scale, color: '#8A8678', fontSize: 11 * scale }}>{item.caption}</Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={{ flex: 1, marginTop: 8 * scale }}
        onLayout={event => {
          const next = event.nativeEvent.layout.height;
          if (next > 80 && Math.abs(next - heroHeight) > 2) {
            setHeroHeight(next);
          }
        }}>
        <AllSetHero width={screenWidth} height={heroHeight} />
      </View>

      <View style={{ paddingHorizontal: 16 * scale, paddingTop: 8 * scale, paddingBottom: 10 * scale }}>
        <GoldCta scale={scale} label="Continue to RACE" onPress={onContinue} />
      </View>
    </View>
  );
}

function SuccessChipIcon({ type, size }: { type: 'bolt' | 'shield' | 'pin'; size: number }) {
  const color = '#D4A017';
  if (type === 'bolt') {
    return <Zap size={size} color={color} fill={color} strokeWidth={1.6} />;
  }
  if (type === 'shield') {
    return <ShieldCheck size={size} color={color} strokeWidth={2} />;
  }
  return <MapPin size={size} color={color} strokeWidth={2} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },
  fill: { flex: 1 },
});
