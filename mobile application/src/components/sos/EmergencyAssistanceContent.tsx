import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Ambulance,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Send,
  Truck,
  User,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import SosPulseButton from './SosPulseButton';
import { AUTH_USER, DEMO_VEHICLE } from '../../constants/auth';
import {
  SOS_COLORS,
  SOS_EMERGENCY_CONTACT,
  SOS_GRID_ACTIONS,
  SOS_LOCATION,
} from '../../constants/sosTheme';
import { brand } from '../../theme/brand';
import type { RootTabParamList } from '../../types/navigation';
import { typography } from '../../theme';

const REF_W = 390;

type Props = {
  showBack?: boolean;
  onBack?: () => void;
  showClose?: boolean;
};

export default function EmergencyAssistanceContent({
  showBack = false,
  onBack,
  showClose = false,
}: Props) {
  const tabNav = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { width } = useWindowDimensions();
  const px = (n: number) => Math.round(n * (width / REF_W));

  const vehicleLabel = `${DEMO_VEHICLE.brand} ${DEMO_VEHICLE.model}`;

  const handleGridAction = (id: string) => {
    switch (id) {
      case 'towing':
        tabNav.navigate('Services', { screen: 'TowingService' });
        break;
      case 'ambulance':
        void Linking.openURL('tel:108');
        break;
      case 'location':
        void Share.share({
          message: `Vehicle ${DEMO_VEHICLE.number} — ${SOS_LOCATION}`,
        });
        break;
      case 'contacts':
        Alert.alert(
          'Emergency Contacts',
          `${SOS_EMERGENCY_CONTACT.name} (${SOS_EMERGENCY_CONTACT.relation})\n${SOS_EMERGENCY_CONTACT.phone}`,
        );
        break;
      default:
        break;
    }
  };

  const sendAlert = () => {
    Alert.alert(
      'Alert Sent',
      `Emergency alert sent to ${SOS_EMERGENCY_CONTACT.name} (${SOS_EMERGENCY_CONTACT.phone}).`,
    );
  };

  const closeSos = () => {
    tabNav.navigate('Home');
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: px(20), paddingBottom: px(32) }}
      showsVerticalScrollIndicator={false}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: px(4),
        }}>
        {showBack && onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={{ paddingVertical: px(4) }}>
            <ChevronLeft size={px(24)} color={SOS_COLORS.white} strokeWidth={2.5} />
          </Pressable>
        ) : (
          <View style={{ width: px(24) }} />
        )}
        {showClose ? (
          <Pressable onPress={closeSos} hitSlop={12} style={{ paddingVertical: px(4) }}>
            <X size={px(24)} color={SOS_COLORS.white} strokeWidth={2.5} />
          </Pressable>
        ) : (
          <View style={{ width: px(24) }} />
        )}
      </View>

      <SosPulseButton px={px} />

      <Text
        style={{
          fontSize: px(26),
          fontWeight: typography.weights.extrabold,
          color: SOS_COLORS.white,
          textAlign: 'center',
          marginBottom: px(10),
        }}>
        Emergency Assistance
      </Text>

      <Text style={{ fontSize: px(14), color: SOS_COLORS.gold, textAlign: 'center' }}>
        Vehicle: {vehicleLabel}
      </Text>
      <Text
        style={{
          fontSize: px(18),
          fontWeight: typography.weights.bold,
          color: SOS_COLORS.white,
          textAlign: 'center',
          marginTop: px(4),
          marginBottom: px(22),
          letterSpacing: 0.5,
        }}>
        {DEMO_VEHICLE.number}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: px(12),
          borderRadius: px(14),
          borderWidth: 1.5,
          borderColor: SOS_COLORS.red,
          backgroundColor: SOS_COLORS.card,
          padding: px(14),
          marginBottom: px(22),
        }}>
        <View
          style={{
            width: px(48),
            height: px(48),
            borderRadius: px(24),
            backgroundColor: '#2A2A2A',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <User size={px(24)} color={SOS_COLORS.grey} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: px(11), color: SOS_COLORS.grey, marginBottom: px(2) }}>
            Vehicle Owner
          </Text>
          <Text style={{ fontSize: px(15), fontWeight: typography.weights.bold, color: SOS_COLORS.white }}>
            {AUTH_USER.name}
          </Text>
          <Text style={{ fontSize: px(13), color: SOS_COLORS.gold, marginTop: px(2) }}>
            {AUTH_USER.phone}
          </Text>
        </View>
        <Pressable
          onPress={() => void Linking.openURL(`tel:${brand.phoneRaw}`)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(6),
            backgroundColor: SOS_COLORS.red,
            paddingHorizontal: px(14),
            paddingVertical: px(12),
            borderRadius: px(10),
            flexShrink: 0,
          }}>
          <Phone size={px(14)} color={SOS_COLORS.white} strokeWidth={2.5} />
          <Text
            numberOfLines={1}
            style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: SOS_COLORS.white }}>
            Call Owner
          </Text>
        </Pressable>
      </View>

      <Text
        style={{
          fontSize: px(16),
          fontWeight: typography.weights.bold,
          color: SOS_COLORS.white,
          marginBottom: px(12),
        }}>
        Emergency Actions
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: px(10), marginBottom: px(22) }}>
        {SOS_GRID_ACTIONS.map(action => {
          const isHorizontal = action.id === 'ambulance' || action.id === 'location' || action.id === 'contacts';
          return (
          <Pressable
            key={action.id}
            onPress={() => handleGridAction(action.id)}
            style={{
              width: '47%',
              minHeight: px(88),
              borderRadius: px(14),
              borderWidth: 1.5,
              borderColor: action.borderColor,
              backgroundColor: action.backgroundColor,
              padding: px(14),
              justifyContent: 'center',
              flexDirection: isHorizontal ? 'row' : 'column',
              alignItems: isHorizontal ? 'center' : 'flex-start',
              gap: isHorizontal ? px(10) : 0,
            }}>
            {action.icon === 'Truck' ? (
              <Truck size={px(28)} color={SOS_COLORS.gold} strokeWidth={2} style={{ marginBottom: px(8) }} />
            ) : action.icon === 'Ambulance' ? (
              <Ambulance size={px(26)} color={SOS_COLORS.white} strokeWidth={2} />
            ) : action.icon === 'MapPin' ? (
              <MapPin size={px(26)} color={SOS_COLORS.white} strokeWidth={2} />
            ) : (
              <View
                style={{
                  width: px(32),
                  height: px(32),
                  borderRadius: px(8),
                  borderWidth: 2,
                  borderColor: SOS_COLORS.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                <Text
                  style={{
                    fontSize: px(10),
                    fontWeight: typography.weights.extrabold,
                    color: SOS_COLORS.white,
                  }}>
                  SOS
                </Text>
              </View>
            )}
            <Text
              numberOfLines={1}
              style={{
                flex: isHorizontal ? 1 : undefined,
                fontSize: px(12),
                fontWeight: typography.weights.bold,
                color: SOS_COLORS.white,
                marginTop: isHorizontal ? 0 : px(8),
              }}>
              {action.label}
            </Text>
          </Pressable>
          );
        })}
      </View>

      <Text
        style={{
          fontSize: px(16),
          fontWeight: typography.weights.bold,
          color: SOS_COLORS.white,
          marginBottom: px(12),
        }}>
        Notify Emergency Contacts
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: px(12),
          borderRadius: px(14),
          borderWidth: 1.5,
          borderColor: SOS_COLORS.red,
          backgroundColor: SOS_COLORS.card,
          padding: px(14),
          marginBottom: px(22),
        }}>
        <View
          style={{
            width: px(44),
            height: px(44),
            borderRadius: px(22),
            backgroundColor: '#2A2A2A',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <User size={px(22)} color={SOS_COLORS.grey} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: px(14), fontWeight: typography.weights.bold, color: SOS_COLORS.white }}>
            {SOS_EMERGENCY_CONTACT.name} ({SOS_EMERGENCY_CONTACT.relation})
          </Text>
          <Text style={{ fontSize: px(13), color: SOS_COLORS.gold, marginTop: px(3) }}>
            {SOS_EMERGENCY_CONTACT.phone}
          </Text>
        </View>
        <Pressable
          onPress={sendAlert}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(6),
            backgroundColor: SOS_COLORS.red,
            paddingHorizontal: px(14),
            paddingVertical: px(12),
            borderRadius: px(10),
            flexShrink: 0,
          }}>
          <Send size={px(14)} color={SOS_COLORS.white} strokeWidth={2.5} />
          <Text
            numberOfLines={1}
            style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: SOS_COLORS.white }}>
            Send Alert
          </Text>
        </Pressable>
      </View>

      <Text
        style={{
          fontSize: px(16),
          fontWeight: typography.weights.bold,
          color: SOS_COLORS.white,
          marginBottom: px(12),
        }}>
        Current Location
      </Text>
      <Pressable
        onPress={() => Alert.alert('Location', SOS_LOCATION)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: px(12),
          borderRadius: px(14),
          borderWidth: 1.5,
          borderColor: SOS_COLORS.gold,
          backgroundColor: SOS_COLORS.card,
          padding: px(14),
          marginBottom: px(24),
        }}>
        <MapPin size={px(22)} color={SOS_COLORS.gold} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: px(12), color: SOS_COLORS.gold, marginBottom: px(3) }}>
            Current Location Detected
          </Text>
          <Text style={{ fontSize: px(14), fontWeight: typography.weights.semibold, color: SOS_COLORS.white }}>
            {SOS_LOCATION}
          </Text>
        </View>
        <ChevronRight size={px(20)} color={SOS_COLORS.gold} strokeWidth={2.5} />
      </Pressable>

      <Text
        style={{
          fontSize: px(13),
          fontWeight: typography.weights.semibold,
          color: SOS_COLORS.gold,
          textAlign: 'center',
          marginTop: px(4),
        }}>
        Powered by RACE Service
      </Text>
    </ScrollView>
  );
}
