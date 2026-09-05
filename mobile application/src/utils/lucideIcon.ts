import { Circle, type LucideIcon } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';

const iconMap = LucideIcons as unknown as Record<string, LucideIcon>;

export function getLucideIcon(name: string): LucideIcon {
  return iconMap[name] ?? Circle;
}
