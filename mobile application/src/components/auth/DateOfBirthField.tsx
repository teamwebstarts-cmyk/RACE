import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

import FormField from './FormField';
import { formatDateApi, getDobMaxDate, DOB_MIN_DATE, parseDob } from '../../utils/date';
import { colors, typography } from '../../theme';

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
  const px = (n: number) => Math.round(n * scale);
  const [showPicker, setShowPicker] = useState(false);
  const pickerDate = useMemo(() => parseDob(value), [value]);
  const maxDate = useMemo(() => getDobMaxDate(), []);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed' || !selected) {
      return;
    }

    onChange(formatDateApi(selected));
  };

  const closePicker = () => setShowPicker(false);

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

      {showPicker && Platform.OS === 'ios' ? (
        <View
          style={[
            styles.iosPickerCard,
            {
              borderRadius: px(14),
              padding: px(12),
              marginBottom: px(16),
            },
          ]}>
          <View style={styles.iosPickerHeader}>
            <Text style={{ fontSize: px(14), color: colors.grey }}>Select date of birth</Text>
            <Pressable onPress={closePicker} hitSlop={8}>
              <Text
                style={{
                  fontSize: px(15),
                  fontWeight: typography.weights.bold,
                  color: colors.primary,
                }}>
                Done
              </Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="spinner"
            maximumDate={maxDate}
            minimumDate={DOB_MIN_DATE}
            onChange={handleChange}
            themeVariant="light"
            style={styles.iosPicker}
          />
        </View>
      ) : null}

      {showPicker && Platform.OS === 'android' ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          maximumDate={maxDate}
          minimumDate={DOB_MIN_DATE}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  iosPickerCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  iosPicker: {
    alignSelf: 'center',
  },
});
