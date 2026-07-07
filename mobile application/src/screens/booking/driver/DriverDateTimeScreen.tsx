import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import TowingBookingLayout, { useBookingTheme } from '../../../components/booking/TowingBookingLayout';
import { DRIVER_CALENDAR_WEEKDAYS, DRIVER_DURATION_OPTIONS } from '../../../constants/driverBooking';
import { useDriverBooking } from '../../../context/DriverBookingContext';
import type { HomeStackParamList } from '../../../types/navigation';
import type { DriverDurationId } from '../../../types/driverBooking';
import {
  buildMonthGrid,
  formatMonthYear,
  isPastDate,
  parseISODate,
  parseStoredDate,
} from '../../../utils/driverCalendar';
import {
  generateTimeSlots,
  isTimeSlotPast,
  parseStoredTime,
} from '../../../utils/driverTime';
import { colors, shadows, typography } from '../../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'DriverDateTime'>;

const TIME_SLOTS = generateTimeSlots(30);
const TIME_COLUMNS = 3;

export default function DriverDateTimeScreen({ navigation }: Props) {
  const { t } = useBookingTheme();
  const { booking, updateBooking } = useDriverBooking();
  const timeScrollRef = useRef<ScrollView>(null);

  const initialDate = parseStoredDate(booking.dateId);
  const initialParsed = parseISODate(initialDate);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewYear, setViewYear] = useState(initialParsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialParsed.getMonth());
  const [durationId, setDurationId] = useState<DriverDurationId>(booking.durationId);
  const [startTime, setStartTime] = useState(parseStoredTime(booking.startTime));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const calendarCells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const selectedTimeIndex = TIME_SLOTS.indexOf(startTime);
  const timeRowHeight = t.px(42);

  useEffect(() => {
    if (!showTimePicker || selectedTimeIndex < 0) {
      return;
    }

    const row = Math.floor(selectedTimeIndex / TIME_COLUMNS);
    timeScrollRef.current?.scrollTo({
      y: Math.max(0, row * timeRowHeight - timeRowHeight),
      animated: false,
    });
  }, [showTimePicker, selectedTimeIndex, timeRowHeight]);

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewYear(year => year - 1);
      setViewMonth(11);
      return;
    }
    setViewMonth(month => month - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(year => year + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth(month => month + 1);
  };

  return (
    <TowingBookingLayout
      title="When do you need a driver?"
      step={1}
      scrollable={showTimePicker}
      onBack={() => navigation.goBack()}
      onContinue={() => {
        updateBooking({ dateId: selectedDate, durationId, startTime });
        navigation.navigate('DriverPickup');
      }}>
      <View style={{ gap: t.px(20) }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: t.px(14),
            }}>
            <Pressable hitSlop={8} onPress={goToPreviousMonth}>
              <ChevronLeft size={t.iconSm} color={colors.dark} />
            </Pressable>
            <Text
              style={{
                fontSize: t.labelBold,
                fontWeight: typography.weights.bold,
                color: colors.dark,
              }}>
              {formatMonthYear(viewYear, viewMonth)}
            </Text>
            <Pressable hitSlop={8} onPress={goToNextMonth}>
              <ChevronRight size={t.iconSm} color={colors.dark} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: t.px(10) }}>
            {DRIVER_CALENDAR_WEEKDAYS.map(day => (
              <Text
                key={day}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: t.caption,
                  fontWeight: typography.weights.semibold,
                  color: colors.grey,
                }}>
                {day}
              </Text>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {calendarCells.map(cell => {
              const selected = selectedDate === cell.iso;
              const muted = !cell.currentMonth;
              const disabled = isPastDate(cell.date);

              return (
                <Pressable
                  key={cell.key}
                  disabled={disabled}
                  onPress={() => {
                    setSelectedDate(cell.iso);
                    if (!cell.currentMonth) {
                      setViewYear(cell.date.getFullYear());
                      setViewMonth(cell.date.getMonth());
                    }
                    if (isTimeSlotPast(cell.iso, startTime)) {
                      const nextSlot = TIME_SLOTS.find(slot => !isTimeSlotPast(cell.iso, slot));
                      if (nextSlot) {
                        setStartTime(nextSlot);
                      }
                    }
                  }}
                  style={{
                    width: `${100 / 7}%`,
                    height: t.px(40),
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.35 : 1,
                  }}>
                  <View
                    style={{
                      width: t.px(34),
                      height: t.px(34),
                      borderRadius: t.px(17),
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? colors.primary : 'transparent',
                    }}>
                    <Text
                      style={{
                        fontSize: t.label,
                        fontWeight: typography.weights.semibold,
                        color: muted ? colors.grey : colors.dark,
                      }}>
                      {cell.day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text
            style={{
              fontSize: t.sectionTitle,
              fontWeight: typography.weights.bold,
              color: colors.dark,
              marginBottom: t.px(10),
            }}>
            Duration
          </Text>
          <View style={{ flexDirection: 'row', gap: t.px(8) }}>
            {DRIVER_DURATION_OPTIONS.map(option => {
              const selected = durationId === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setDurationId(option.id)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: t.px(12),
                    borderRadius: t.px(24),
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : colors.background,
                  }}>
                  <Text
                    style={{
                      fontSize: t.caption,
                      fontWeight: typography.weights.bold,
                      color: selected ? colors.background : colors.dark,
                    }}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text
            style={{
              fontSize: t.sectionTitle,
              fontWeight: typography.weights.bold,
              color: colors.dark,
              marginBottom: t.px(10),
            }}>
            Start Time
          </Text>
          <Pressable
            onPress={() => setShowTimePicker(open => !open)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: t.inputRadius,
              borderWidth: 1.5,
              borderColor: colors.primary,
              backgroundColor: colors.background,
              paddingHorizontal: t.px(16),
              paddingVertical: t.px(14),
            }}>
            <Clock size={t.iconSm} color={colors.primary} strokeWidth={2} />
            <Text
              style={{
                flex: 1,
                marginLeft: t.px(12),
                fontSize: t.labelBold,
                fontWeight: typography.weights.bold,
                color: colors.primary,
              }}>
              {startTime}
            </Text>
            {showTimePicker ? (
              <ChevronUp size={t.iconSm} color={colors.primary} strokeWidth={2.5} />
            ) : (
              <ChevronDown size={t.iconSm} color={colors.primary} strokeWidth={2.5} />
            )}
          </Pressable>

          {showTimePicker ? (
            <View
              style={[
                {
                  marginTop: t.px(10),
                  borderRadius: t.inputRadius,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  maxHeight: t.px(252),
                  overflow: 'hidden',
                },
                shadows.card,
              ]}>
              <ScrollView
                ref={timeScrollRef}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: t.px(8) }}>
                  {TIME_SLOTS.map(slot => {
                    const selected = startTime === slot;
                    const past = isTimeSlotPast(selectedDate, slot);
                    return (
                      <Pressable
                        key={slot}
                        disabled={past}
                        onPress={() => {
                          setStartTime(slot);
                          setShowTimePicker(false);
                        }}
                        style={{
                          width: `${100 / TIME_COLUMNS}%`,
                          paddingHorizontal: t.px(4),
                          paddingVertical: t.px(4),
                          opacity: past ? 0.35 : 1,
                        }}>
                        <View
                          style={{
                            minHeight: timeRowHeight - t.px(8),
                            borderRadius: t.px(10),
                            borderWidth: selected ? 1.5 : 1,
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.goldLight : colors.background,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: t.caption,
                              fontWeight: typography.weights.bold,
                              color: selected ? colors.primary : colors.dark,
                            }}>
                            {slot}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>
    </TowingBookingLayout>
  );
}
