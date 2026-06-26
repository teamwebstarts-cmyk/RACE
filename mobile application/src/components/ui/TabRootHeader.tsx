import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';

import { useScreenPx } from '../../hooks/useScreenPx';
import { USER } from '../../constants/demo';
import { colors, typography } from '../../theme';

type Props = {
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  avatarLabel?: string;
  showActions?: boolean;
  actions?: ReactNode;
};

export default function TabRootHeader({
  title,
  subtitle,
  leading,
  avatarLabel = USER.name.charAt(0),
  showActions = true,
  actions,
}: Props) {
  const px = useScreenPx();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingHorizontal: px(20),
          paddingBottom: px(12),
        },
      ]}>
      <View style={styles.row}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {leading ?? (
            <>
              <Text
                style={{
                  fontSize: px(28),
                  fontWeight: typography.weights.extrabold,
                  color: colors.dark,
                }}>
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={{
                    marginTop: px(4),
                    fontSize: px(13),
                    color: colors.grey,
                    lineHeight: px(18),
                  }}>
                  {subtitle}
                </Text>
              ) : null}
            </>
          )}
        </View>
        {actions ?? (showActions ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(12) }}>
            <Pressable hitSlop={8} style={styles.bellWrap}>
              <Bell size={px(22)} color={colors.dark} strokeWidth={2} />
              <View style={styles.bellDot} />
            </Pressable>
            <View
              style={[
                styles.avatar,
                { width: px(40), height: px(40), borderRadius: px(20) },
              ]}>
              <Text
                style={{
                  fontSize: px(15),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                }}>
                {avatarLabel}
              </Text>
            </View>
          </View>
        ) : null)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bellWrap: {
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  avatar: {
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
