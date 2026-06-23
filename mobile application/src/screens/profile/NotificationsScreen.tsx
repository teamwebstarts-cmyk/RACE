import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Bell,
  CheckCircle,
  IndianRupee,
  Star,
  Tag,
  Truck,
  type LucideIcon,
} from 'lucide-react-native';

import ProfileSubScreenLayout, { useProfilePx } from '../../components/profile/ProfileSubScreenLayout';
import { NOTIFICATIONS } from '../../constants/demo';
import type { NotificationItem } from '../../types/models';
import { colors, typography } from '../../theme';

const ICONS: Record<string, LucideIcon> = {
  Truck,
  Star,
  Tag,
  CheckCircle,
  IndianRupee,
};

function groupNotifications(items: NotificationItem[]) {
  const today: NotificationItem[] = [];
  const yesterday: NotificationItem[] = [];
  items.forEach(item => {
    if (item.time.toLowerCase().includes('min') || item.time.toLowerCase().includes('hour')) {
      today.push(item);
    } else {
      yesterday.push(item);
    }
  });
  return { today, yesterday };
}

function NotificationCard({
  item,
  px,
}: {
  item: NotificationItem;
  px: (n: number) => number;
}) {
  const Icon = ICONS[item.icon] ?? Bell;
  const unread = !item.isRead;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: px(10),
        borderRadius: px(12),
        borderWidth: 1,
        borderColor: unread ? '#FFE4A8' : colors.border,
        borderLeftWidth: unread ? px(4) : 1,
        borderLeftColor: unread ? colors.primary : colors.border,
        backgroundColor: unread ? '#FFFBF0' : colors.background,
        padding: px(12),
        marginBottom: px(10),
      }}>
      <View
        style={{
          width: px(38),
          height: px(38),
          borderRadius: px(19),
          backgroundColor: unread ? colors.goldLight : colors.lightGrey,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
        <Icon size={px(18)} color={unread ? colors.primary : colors.grey} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: px(8) }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: px(13),
              fontWeight: typography.weights.bold,
              color: colors.dark,
            }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: px(10), color: colors.grey, flexShrink: 0 }}>{item.time}</Text>
        </View>
        <Text style={{ fontSize: px(11), color: colors.grey, marginTop: px(4), lineHeight: px(15) }}>
          {item.message}
        </Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const px = useProfilePx();
  const [items, setItems] = useState(NOTIFICATIONS);
  const groups = useMemo(() => groupNotifications(items), [items]);

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <ProfileSubScreenLayout
      title="Notifications"
      headerRight={
        <Pressable onPress={markAllRead} hitSlop={8}>
          <Text style={{ fontSize: px(12), fontWeight: typography.weights.bold, color: colors.primary }}>
            Mark all read
          </Text>
        </Pressable>
      }>
      {groups.today.length > 0 ? (
        <>
          <Text
            style={{
              fontSize: px(11),
              fontWeight: typography.weights.bold,
              color: colors.grey,
              letterSpacing: 0.8,
              marginBottom: px(8),
            }}>
            TODAY
          </Text>
          {groups.today.map(item => (
            <NotificationCard key={item.id} item={item} px={px} />
          ))}
        </>
      ) : null}

      {groups.yesterday.length > 0 ? (
        <>
          <Text
            style={{
              fontSize: px(11),
              fontWeight: typography.weights.bold,
              color: colors.grey,
              letterSpacing: 0.8,
              marginTop: px(4),
              marginBottom: px(8),
            }}>
            YESTERDAY
          </Text>
          {groups.yesterday.map(item => (
            <NotificationCard key={item.id} item={item} px={px} />
          ))}
        </>
      ) : null}

      <View style={{ alignItems: 'center', paddingTop: px(16), paddingBottom: px(8) }}>
        <Bell size={px(36)} color={colors.primary} strokeWidth={1.8} />
        <Text style={{ marginTop: px(8), fontSize: px(13), color: colors.grey }}>
          You're all caught up!
        </Text>
      </View>
    </ProfileSubScreenLayout>
  );
}
