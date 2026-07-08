import React from 'react';
import { Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackHeaderLeftProps } from '@react-navigation/native-stack';

import { colors } from '../../theme';

export default function StackBackButton({ canGoBack }: NativeStackHeaderLeftProps) {
  const navigation = useNavigation();
  const allowBack = canGoBack || navigation.canGoBack();

  if (!allowBack) {
    return null;
  }

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={12}
      style={{ marginLeft: 4, padding: 6, minWidth: 40, minHeight: 40, justifyContent: 'center' }}
      accessibilityRole="button"
      accessibilityLabel="Go back">
      <ArrowLeft size={22} color={colors.dark} strokeWidth={2.5} />
    </Pressable>
  );
}
