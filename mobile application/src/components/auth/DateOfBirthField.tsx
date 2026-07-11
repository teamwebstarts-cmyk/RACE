import React, { useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'lucide-react-native';

import DateOfBirthPickerModal from './DateOfBirthPickerModal';
import FormField from './FormField';
import { colors } from '../../theme';

interface DateOfBirthFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  scale?: number;
  required?: boolean;
  variant?: 'filled' | 'outlined';
}

export default function DateOfBirthField({
  value,
  onChange,
  error,
  scale = 1,
  required = true,
  variant = 'outlined',
}: DateOfBirthFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <FormField
        variant={variant}
        compact={variant === 'outlined'}
        scale={scale}
        label="Date of Birth"
        required={required}
        Icon={Calendar}
        iconColor={colors.primary}
        value={value}
        placeholder="Tap to select date"
        editable={false}
        onPress={() => setShowPicker(true)}
        error={error}
      />

      <DateOfBirthPickerModal
        visible={showPicker}
        value={value}
        onConfirm={onChange}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
}
