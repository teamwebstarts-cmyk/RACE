import React from 'react';
import { Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackHeaderLeftProps } from '@react-navigation/native-stack';

import { colors } from '../../theme';

export default function StackBackButton({ canGoBack }: NativeStackHeaderLeftProps) {
  const navigation = useNavigation();

  if (!canGoBack) {
    return null;
  }

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={10}
      style={{ marginLeft: 4, padding: 4 }}
      accessibilityRole="button"
      accessibilityLabel="Go back">
      <ArrowLeft size={22} color={colors.dark} strokeWidth={2.5} />
    </Pressable>
  );
}
