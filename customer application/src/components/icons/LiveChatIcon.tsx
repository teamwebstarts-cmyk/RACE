import React from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';

type Props = {
  size?: number;
};

export default function LiveChatIcon({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect x="6" y="8" width="36" height="28" rx="8" fill="#FFB800" />
      <Circle cx="16" cy="22" r="2.5" fill="#1A1A1A" />
      <Circle cx="24" cy="22" r="2.5" fill="#1A1A1A" />
      <Circle cx="32" cy="22" r="2.5" fill="#1A1A1A" />
      <Rect x="14" y="34" width="10" height="8" rx="2" fill="#FFB800" />
    </Svg>
  );
}
