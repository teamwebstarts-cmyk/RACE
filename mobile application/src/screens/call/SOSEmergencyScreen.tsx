import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertCircle,
  Car,
  Check,
  Hospital,
  MapPin,
  Phone,
  Truck,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import GoldButton from '../../components/auth/GoldButton';
import QRCodePlaceholder from '../../components/auth/QRCodePlaceholder';
import { AuthBackHeader } from '../../components/auth/StepHeader';
import { AUTH_USER, DEMO_VEHICLE } from '../../constants/auth';
import { SOS_VEHICLE_ACTIONS } from '../../constants/sosEmergency';
import { brand } from '../../theme/brand';
import type { CallStackParamList, RootTabParamList } from '../../types/navigation';
import { colors, shadows, typography } from '../../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<CallStackParamList, 'SOSEmergency'>;

const ACTION_ICONS: Record<string, typeof Phone> = {
  Phone,
  AlertCircle,
  Truck,
  MapPin,
  Hospital,
};

export default function SOSEmergencyScreen({ navigation }: Props) {
  const tabNav = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { width } = useWindowDimensions();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const vehicleLine = `${DEMO_VEHICLE.brand} ${DEMO_VEHICLE.model} · ${DEMO_VEHICLE.color}`;

  const handleAction = (id: string) => {
    switch (id) {
      case 'contact':
        void Linking.openURL(`tel:${brand.phoneRaw}`);
        break;
      case 'alert':
        Alert.alert('Alert Sent', `Emergency alert sent to ${AUTH_USER.name} (${AUTH_USER.phone}).`);
        break;
      case 'towing':
        tabNav.navigate('Services', { screen: 'TowingService' });
        break;
      case 'location':
        void Share.share({
          message: `Vehicle ${DEMO_VEHICLE.number} location: Patia Square, Bhubaneswar`,
        });
        break;
      case 'hospital':
        Alert.alert('Nearest Hospital', 'Capital Hospital — 2.4 km away\nPhone: 0674-2390000');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: px(20), paddingBottom: px(24) }}
        showsVerticalScrollIndicator={false}>
        <AuthBackHeader onBack={() => navigation.goBack()} />

        <Animated.View
          style={{
            alignSelf: 'center',
            width: px(64),
            height: px(64),
            borderRadius: px(32),
            backgroundColor: '#FEE2E2',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: px(14),
            transform: [{ scale: scaleAnim }],
          }}>
          <Check size={px(32)} color={colors.error} strokeWidth={3} />
        </Animated.View>

        <Text
          style={{
            fontSize: px(22),
            fontWeight: typography.weights.extrabold,
            color: colors.dark,
            textAlign: 'center',
            marginBottom: px(6),
          }}>
          Vehicle Identified
        </Text>
        <Text style={{ fontSize: px(13), color: colors.grey, textAlign: 'center', marginBottom: px(20) }}>
          QR scanned successfully · Choose an action below
        </Text>

        <View
          style={[
            {
              borderRadius: px(14),
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              padding: px(16),
              marginBottom: px(16),
              alignItems: 'center',
            },
            shadows.card,
          ]}>
          <QRCodePlaceholder size={px(120)} scale={s} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8), marginTop: px(14) }}>
            <Car size={px(18)} color={colors.primary} />
            <Text style={{ fontSize: px(16), fontWeight: typography.weights.bold, color: colors.dark }}>
              {DEMO_VEHICLE.number}
            </Text>
          </View>
          <Text style={{ fontSize: px(12), color: colors.grey, marginTop: px(4) }}>{vehicleLine}</Text>
          <View
            style={{
              marginTop: px(12),
              paddingHorizontal: px(12),
              paddingVertical: px(8),
              borderRadius: px(10),
              backgroundColor: colors.goldLight,
              width: '100%',
            }}>
            <Text style={{ fontSize: px(11), color: colors.grey }}>Registered Owner</Text>
            <Text style={{ fontSize: px(14), fontWeight: typography.weights.bold, color: colors.dark }}>
              {AUTH_USER.name}
            </Text>
            <Text style={{ fontSize: px(12), color: colors.grey, marginTop: px(2) }}>{AUTH_USER.phone}</Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: px(15),
            fontWeight: typography.weights.bold,
            color: colors.dark,
            marginBottom: px(10),
          }}>
          Emergency Actions
        </Text>

        <View style={{ gap: px(8), marginBottom: px(18) }}>
          {SOS_VEHICLE_ACTIONS.map(action => {
            const Icon = ACTION_ICONS[action.icon] ?? AlertCircle;
            const isAlert = action.id === 'alert';
            return (
              <Pressable
                key={action.id}
                onPress={() => handleAction(action.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: px(12),
                  borderRadius: px(12),
                  borderWidth: isAlert ? 2 : 1,
                  borderColor: isAlert ? colors.error : colors.border,
                  backgroundColor: isAlert ? '#FEF2F2' : colors.background,
                  padding: px(14),
                }}>
                <View
                  style={{
                    width: px(40),
                    height: px(40),
                    borderRadius: px(20),
                    backgroundColor: isAlert ? '#FEE2E2' : colors.goldLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon size={px(20)} color={isAlert ? colors.error : colors.primary} strokeWidth={2} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: px(14),
                    fontWeight: typography.weights.bold,
                    color: colors.dark,
                  }}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <GoldButton
          label="Send Emergency Alert"
          onPress={() => handleAction('alert')}
          style={{ width: '100%' }}
          height={px(52)}
          labelSize={px(16)}
          borderRadius={px(14)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
});
