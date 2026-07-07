import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Location from 'expo-location';
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
import { useSosDetails } from '../../context/SosDetailsContext';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../services/api';
import {
  useSosAlertMutation,
  useSosConfigQuery,
  useSosContextQuery,
} from '../../services/sos/useSosQueries';
import {
  SOS_COLORS,
  SOS_GRID_ACTIONS,
} from '../../constants/sosTheme';
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
  const { details } = useSosDetails();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { data: config } = useSosConfigQuery();
  const { data: context, isLoading: contextLoading } = useSosContextQuery(undefined, isAuthenticated);
  const sosAlert = useSosAlertMutation();
  const { width } = useWindowDimensions();
  const px = (n: number) => Math.round(n * (width / REF_W));

  const emergencyPhone = config?.emergencyPhone ?? '108';
  const supportPhone = config?.supportPhone ?? config?.emergencyPhone ?? '';

  const vehicleLabel = context?.vehicle
    ? context.vehicle.label
    : `${details.vehicleBrand} ${details.vehicleModel}`.trim();
  const vehicleNumber = context?.vehicle?.number ?? details.vehicleNumber;
  const ownerName = context?.owner?.name ?? details.ownerName;
  const ownerPhoneRaw = (context?.owner?.phone ?? details.ownerPhone).replace(/\s/g, '');
  const contactName = context?.emergencyContact?.name ?? details.contactName;
  const contactPhone = context?.emergencyContact?.mobileNumber ?? details.contactPhone;
  const contactRelation = context?.emergencyContact?.relationship ?? details.contactRelation;
  const vehicleId = context?.vehicle?.id;

  const resolveLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { address: details.location };
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const address = details.location;
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address,
      };
    } catch {
      return { address: details.location };
    }
  }, [details.location]);

  const triggerAlert = useCallback(
    async (
      action: 'sos' | 'towing' | 'ambulance' | 'share_location' | 'notify_contacts',
      successTitle: string,
    ) => {
      if (!isAuthenticated) {
        Alert.alert('Sign in required', 'Please log in to use emergency alerts.');
        return;
      }

      const location = await resolveLocation();
      sosAlert.mutate(
        { action, vehicleId, ...location },
        {
          onSuccess: result => Alert.alert(successTitle, result.message),
          onError: error => Alert.alert('Request failed', getApiErrorMessage(error)),
        },
      );
    },
    [isAuthenticated, resolveLocation, sosAlert, vehicleId],
  );

  const handleGridAction = (id: string) => {
    switch (id) {
      case 'towing':
        if (isAuthenticated) {
          void triggerAlert('towing', 'Towing Requested');
        } else {
          tabNav.navigate('Services', { screen: 'TowingService' });
        }
        break;
      case 'ambulance':
        void Linking.openURL(`tel:${emergencyPhone.replace(/\s/g, '')}`);
        break;
      case 'location':
        if (isAuthenticated) {
          void triggerAlert('share_location', 'Location Shared');
        } else {
          void Share.share({ message: `Vehicle ${vehicleNumber} — ${details.location}` });
        }
        break;
      case 'contacts':
        if (isAuthenticated) {
          void triggerAlert('notify_contacts', 'Contact Notified');
        } else {
          Alert.alert('Emergency Contacts', `${contactName} (${contactRelation})\n${contactPhone}`);
        }
        break;
      default:
        break;
    }
  };

  const sendAlert = () => {
    void triggerAlert('sos', 'Emergency Alert Sent');
  };

  const closeSos = () => {
    tabNav.navigate('Home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: SOS_COLORS.bg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: px(20),
          paddingTop: px(4),
          paddingBottom: px(8),
          borderBottomWidth: 1,
          borderBottomColor: SOS_COLORS.cardBorder,
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: px(20), paddingBottom: px(32) }}
        showsVerticalScrollIndicator={false}>
      <SosPulseButton px={px} onPress={sendAlert} />

      {contextLoading && isAuthenticated ? (
        <ActivityIndicator color={SOS_COLORS.gold} style={{ marginBottom: px(10) }} />
      ) : null}

      {supportPhone ? (
        <Text style={{ fontSize: px(12), color: SOS_COLORS.grey, textAlign: 'center', marginBottom: px(8) }}>
          Support: {supportPhone} · Emergency: {emergencyPhone}
        </Text>
      ) : null}

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
        {vehicleNumber}
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
            {ownerName}
          </Text>
          <Text style={{ fontSize: px(13), color: SOS_COLORS.gold, marginTop: px(2) }}>
            {context?.owner?.phone ?? details.ownerPhone}
          </Text>
        </View>
        <Pressable
          onPress={() => void Linking.openURL(`tel:${ownerPhoneRaw}`)}
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
            {contactName} ({contactRelation})
          </Text>
          <Text style={{ fontSize: px(13), color: SOS_COLORS.gold, marginTop: px(3) }}>
            {contactPhone}
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
        onPress={() => Alert.alert('Location', details.location)}
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
            {details.location}
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
    </View>
  );
}
