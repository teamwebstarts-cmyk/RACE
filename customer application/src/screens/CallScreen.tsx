import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmergencyAssistanceContent from '../components/sos/EmergencyAssistanceContent';
import { SOS_COLORS } from '../constants/sosTheme';
import type { CallStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<CallStackParamList, 'CallMain'>;

export default function CallScreen(_props: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <EmergencyAssistanceContent showClose />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SOS_COLORS.bg },
});
