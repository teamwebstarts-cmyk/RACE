import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { useScreenPx } from '../../hooks/useScreenPx';
import { colors } from '../../theme';

type Props = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  horizontalPadding?: number;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  edges?: Edge[];
};

export default function AppScreenLayout({
  header,
  footer,
  children,
  scrollable = true,
  keyboardAvoiding = false,
  horizontalPadding,
  contentStyle,
  backgroundColor = colors.background,
  edges = ['top'],
}: Props) {
  const insets = useSafeAreaInsets();
  const px = useScreenPx();
  const paddingX = horizontalPadding ?? px(20);

  const body = scrollable ? (
    <ScrollView
      style={styles.flex}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        {
          paddingHorizontal: paddingX,
          paddingBottom: px(20) + insets.bottom,
        },
        contentStyle,
      ]}>
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        { paddingHorizontal: paddingX, paddingBottom: insets.bottom },
        contentStyle,
      ]}>
      {children}
    </View>
  );

  const content = (
    <View style={[styles.flex, { backgroundColor }]}>
      {header}
      {body}
      {footer}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <SafeAreaView style={styles.flex} edges={edges}>
        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
});
