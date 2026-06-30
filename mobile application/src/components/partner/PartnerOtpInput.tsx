import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

const OTP_LENGTH = 6;

interface PartnerOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onComplete?: (value: string) => void;
}

export default function PartnerOtpInput({
  value,
  onChange,
  disabled = false,
  onComplete,
}: PartnerOtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (value.length === OTP_LENGTH) {
      onComplete?.(value);
    }
  }, [onComplete, value]);

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        editable={!disabled}
        caretHidden
        style={styles.hiddenInput}
        accessibilityLabel="One-time password input"
      />

      <View style={styles.row}>
        {Array.from({ length: OTP_LENGTH }, (_, index) => {
          const digit = value[index] ?? '';
          const isFilled = digit.length > 0;
          const isActive = !disabled && activeIndex === index && value.length === index;
          const useRedBorder = isFilled || isActive;

          return (
            <Pressable
              key={index}
              disabled={disabled}
              onPress={() => inputRef.current?.focus()}
              style={[
                styles.box,
                useRedBorder ? styles.boxActive : styles.boxIdle,
              ]}>
              <TextInput
                value={isFilled ? digit : ''}
                editable={false}
                style={styles.digit}
                pointerEvents="none"
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxIdle: {
    borderColor: colors.border,
  },
  boxActive: {
    borderColor: colors.partnerRed,
  },
  digit: {
    width: '100%',
    textAlign: 'center',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    padding: 0,
  },
});
