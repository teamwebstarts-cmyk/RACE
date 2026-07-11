import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import LocationPickerModal from '../../components/common/LocationPickerModal';
import { useUserLocationStore } from '../../store/userLocationStore';
import type { HomeStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'SelectLocation'>;

export default function SelectLocationScreen({ navigation }: Props) {
  const savedLocation = useUserLocationStore(state => state.location);
  const setUserLocation = useUserLocationStore(state => state.setLocation);

  return (
    <View style={{ flex: 1 }}>
      <LocationPickerModal
        visible
        title="Select your location"
        confirmLabel="Use this location"
        initialLocation={
          savedLocation
            ? {
                address: savedLocation.address,
                latitude: savedLocation.latitude,
                longitude: savedLocation.longitude,
              }
            : undefined
        }
        onClose={() => navigation.goBack()}
        onLocationSelected={location => {
          void setUserLocation(location);
          navigation.goBack();
        }}
      />
    </View>
  );
}
