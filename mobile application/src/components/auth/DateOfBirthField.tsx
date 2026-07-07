import React, { useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'lucide-react-native';

import DateOfBirthPickerModal from './DateOfBirthPickerModal';
import FormField from './FormField';

interface DateOfBirthFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  scale?: number;
  required?: boolean;
}

export default function DateOfBirthField({
  value,
  onChange,
  error,
  scale = 1,
  required = true,
}: DateOfBirthFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <FormField
        variant="outlined"
        compact
        scale={scale}
        label="Date of Birth"
        required={required}
        Icon={Calendar}
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
