import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Rocket } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MORE_SERVICES_ITEMS } from '../constants/moreServices';
import type { HomeStackParamList } from '../types/navigation';
import { colors, shadows, typography } from '../theme';

const REF_W = 390;

type Props = NativeStackScreenProps<HomeStackParamList, 'MoreServices'>;

export default function MoreServicesScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / REF_W;
  const px = (n: number) => Math.round(n * s);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: px(20),
            paddingBottom: px(16) + insets.bottom,
          }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ marginBottom: px(8) }}>
            <ArrowLeft size={px(22)} color={colors.dark} strokeWidth={2.5} />
          </Pressable>

          <View style={{ marginBottom: px(16) }}>
            <Text
              style={{
                fontSize: px(26),
                fontWeight: typography.weights.extrabold,
                color: colors.dark,
                textAlign: 'center',
              }}>
              More Services
            </Text>
            <Text
              style={{
                marginTop: px(6),
                fontSize: px(13),
                color: colors.grey,
                textAlign: 'center',
              }}>
              Coming Soon — Exciting new services!
            </Text>
          </View>

          <View
            style={[
              {
                borderRadius: px(14),
                backgroundColor: colors.goldLight,
                padding: px(16),
                marginBottom: px(16),
                overflow: 'hidden',
              },
              shadows.card,
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
              <Rocket size={px(18)} color={colors.primary} />
              <Text
                style={{
                  fontSize: px(16),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                }}>
                Expanding Soon!
              </Text>
            </View>
            <Text
              style={{
                marginTop: px(6),
                fontSize: px(13),
                color: colors.grey,
                lineHeight: px(18),
              }}>
              We're working hard to bring you more amazing services.
            </Text>
          </View>

          <View style={{ gap: px(10) }}>
            {MORE_SERVICES_ITEMS.map(item => (
              <View
                key={item.id}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: px(12),
                    borderRadius: px(14),
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    padding: px(14),
                  },
                  shadows.card,
                ]}>
                <View
                  style={{
                    width: px(44),
                    height: px(44),
                    borderRadius: px(22),
                    backgroundColor: colors.goldLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <item.Icon size={px(20)} color={colors.dark} strokeWidth={2} />
                </View>

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: px(6),
                      marginBottom: px(4),
                    }}>
                    <Text
                      style={{
                        fontSize: px(15),
                        fontWeight: typography.weights.bold,
                        color: colors.dark,
                      }}>
                      {item.title}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: px(8),
                        paddingVertical: px(3),
                        borderRadius: px(10),
                        backgroundColor: colors.goldLight,
                      }}>
                      <Text
                        style={{
                          fontSize: px(10),
                          fontWeight: typography.weights.bold,
                          color: colors.primary,
                        }}>
                        Coming Soon
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: px(12),
                      color: colors.grey,
                      lineHeight: px(16),
                    }}>
                    {item.description}
                  </Text>
                </View>

                <Pressable
                  style={{
                    paddingHorizontal: px(10),
                    paddingVertical: px(8),
                    borderRadius: px(10),
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                  }}>
                  <Text
                    style={{
                      fontSize: px(11),
                      fontWeight: typography.weights.bold,
                      color: colors.primary,
                    }}>
                    Notify Me
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: px(10),
              borderRadius: px(14),
              backgroundColor: colors.goldLight,
              padding: px(14),
              marginTop: px(16),
            }}>
            <View
              style={{
                width: px(40),
                height: px(40),
                borderRadius: px(20),
                backgroundColor: colors.background,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Bell size={px(18)} color={colors.primary} />
            </View>
            <Text style={{ flex: 1, fontSize: px(12), color: colors.dark, lineHeight: px(17) }}>
              Get notified when services launch! We'll alert you as soon as available.
            </Text>
            <Pressable
              style={{
                paddingHorizontal: px(10),
                paddingVertical: px(10),
                borderRadius: px(10),
                backgroundColor: colors.primary,
              }}>
              <Text
                style={{
                  fontSize: px(11),
                  fontWeight: typography.weights.bold,
                  color: colors.dark,
                }}>
                Enable{'\n'}Notifications
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
});
