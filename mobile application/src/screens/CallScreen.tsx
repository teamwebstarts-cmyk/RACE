import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  MapPin,
  Phone,
  QrCode,
  ScanLine,
  ShieldAlert,
  Truck,
  Wrench,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import GoldButton from '../components/auth/GoldButton';
import { SOS_HOTLINES, SOS_QUICK_ACTIONS } from '../constants/sosEmergency';
import { brand } from '../theme/brand';
import type { CallStackParamList, RootTabParamList } from '../types/navigation';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<CallStackParamList, 'CallMain'>;

export default function CallScreen({ navigation }: Props) {
  const tabNav = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  const handleQuickAction = (id: string) => {
    if (id === 'scan') {
      navigation.navigate('QRScan');
      return;
    }
    if (id === 'towing') {
      tabNav.navigate('Services', { screen: 'TowingService' });
      return;
    }
    if (id === 'roadside') {
      tabNav.navigate('Services', { screen: 'RoadsideAssistance' });
      return;
    }
    if (id === 'location') {
      void Share.share({ message: 'My location: Patia Square, Bhubaneswar, Odisha' });
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: px(20),
            paddingBottom: px(24) + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}>
          <Text
            style={{
              fontSize: px(28),
              fontWeight: typography.weights.extrabold,
              color: colors.dark,
              marginBottom: px(4),
            }}>
            Emergency SOS
          </Text>
          <Text style={{ fontSize: px(13), color: colors.grey, marginBottom: px(20) }}>
            Quick help when you need it most
          </Text>

          <View
            style={{
              borderRadius: px(16),
              backgroundColor: colors.error,
              padding: px(18),
              marginBottom: px(18),
              ...shadows.card,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(10), marginBottom: px(12) }}>
              <ShieldAlert size={px(28)} color={colors.background} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: px(16), fontWeight: typography.weights.bold, color: colors.background }}>
                  RACE Emergency Line
                </Text>
                <Text style={{ fontSize: px(12), color: 'rgba(255,255,255,0.85)', marginTop: px(2) }}>
                  Available 24/7 · Average response 8 min
                </Text>
              </View>
            </View>
            <GoldButton
              label="Call RACE Now"
              onPress={() => void Linking.openURL(`tel:${brand.phoneRaw}`)}
              style={{ width: '100%' }}
              height={px(48)}
              labelSize={px(15)}
              borderRadius={px(12)}
            />
          </View>

          <Pressable
            onPress={() => navigation.navigate('QRScan')}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: px(14),
                borderRadius: px(14),
                borderWidth: 2,
                borderColor: colors.primary,
                backgroundColor: colors.goldLight,
                padding: px(16),
                marginBottom: px(18),
              },
              shadows.card,
            ]}>
            <View
              style={{
                width: px(52),
                height: px(52),
                borderRadius: px(26),
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <QrCode size={px(26)} color={colors.dark} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: px(16), fontWeight: typography.weights.bold, color: colors.dark }}>
                Scan Vehicle QR
              </Text>
              <Text style={{ fontSize: px(12), color: colors.grey, marginTop: px(2) }}>
                Scan a vehicle tag to contact owner or send SOS
              </Text>
            </View>
            <ScanLine size={px(22)} color={colors.primary} />
          </Pressable>

          <Text
            style={{
              fontSize: px(15),
              fontWeight: typography.weights.bold,
              color: colors.dark,
              marginBottom: px(10),
            }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: px(10), marginBottom: px(20) }}>
            {SOS_QUICK_ACTIONS.map(action => {
              const Icon =
                action.icon === 'ScanLine'
                  ? ScanLine
                  : action.icon === 'Truck'
                    ? Truck
                    : action.icon === 'Wrench'
                      ? Wrench
                      : MapPin;
              return (
                <Pressable
                  key={action.id}
                  onPress={() => handleQuickAction(action.id)}
                  style={{
                    width: '47%',
                    borderRadius: px(12),
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    padding: px(14),
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: px(40),
                      height: px(40),
                      borderRadius: px(20),
                      backgroundColor: colors.goldLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: px(8),
                    }}>
                    <Icon size={px(20)} color={colors.primary} strokeWidth={2} />
                  </View>
                  <Text
                    style={{
                      fontSize: px(12),
                      fontWeight: typography.weights.bold,
                      color: colors.dark,
                      textAlign: 'center',
                    }}>
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text
            style={{
              fontSize: px(15),
              fontWeight: typography.weights.bold,
              color: colors.dark,
              marginBottom: px(10),
            }}>
            Emergency Hotlines
          </Text>
          <View style={{ gap: px(8) }}>
            {SOS_HOTLINES.map(line => (
              <Pressable
                key={line.id}
                onPress={() => void Linking.openURL(`tel:${line.number.replace(/-/g, '')}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: px(12),
                  borderWidth: 1,
                  borderColor: line.primary ? colors.primary : colors.border,
                  backgroundColor: line.primary ? colors.goldLight : colors.background,
                  padding: px(14),
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(10) }}>
                  <Phone size={px(18)} color={line.primary ? colors.primary : colors.dark} />
                  <Text style={{ fontSize: px(14), fontWeight: typography.weights.semibold, color: colors.dark }}>
                    {line.label}
                  </Text>
                </View>
                <Text style={{ fontSize: px(14), fontWeight: typography.weights.bold, color: colors.primary }}>
                  {line.number}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: px(8),
              marginTop: px(18),
              borderRadius: px(10),
              backgroundColor: colors.lightGrey,
              padding: px(12),
            }}>
            <AlertTriangle size={px(16)} color={colors.error} />
            <Text style={{ flex: 1, fontSize: px(11), color: colors.dark, lineHeight: px(16) }}>
              In life-threatening emergencies, call 108 (Ambulance) or 100 (Police) immediately.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
});
