import { useWindowDimensions } from 'react-native';

export const SCREEN_REF_W = 390;

export function useScreenPx(refW = SCREEN_REF_W) {
  const { width } = useWindowDimensions();
  const scale = width / refW;
  return (n: number) => Math.round(n * scale);
}
