import React, { useEffect, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
}: OtpInputProps) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));

  useEffect(() => {
    const next = value.split('').slice(0, length);
    while (next.length < length) {
      next.push('');
    }
    setDigits(next);
  }, [value, length]);

  const updateDigits = (nextDigits: string[]) => {
    setDigits(nextDigits);
    onChange(nextDigits.join(''));
  };

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/\D/g, '');

    if (sanitized.length > 1) {
      const pasted = sanitized.slice(0, length).split('');
      const nextDigits = [...digits];
      pasted.forEach((digit, offset) => {
        if (index + offset < length) {
          nextDigits[index + offset] = digit;
        }
      });
      updateDigits(nextDigits);
      const focusIndex = Math.min(index + pasted.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = sanitized;
    updateDigits(nextDigits);

    if (sanitized && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.box, digit ? styles.boxFilled : null]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    textAlign: 'center',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#FFF9E8',
  },
});
