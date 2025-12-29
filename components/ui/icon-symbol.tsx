// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'magnifyingglass': 'search',
  'bell': 'notifications-none',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'plus': 'add',
  'creditcard': 'credit-card',
  'qrcode': 'qr-code-scanner',
  'chart.bar': 'bar-chart',
  'chart.line.uptrend.xyv': 'trending-up',
  'arrow.up.right': 'north-east',
  'arrow.down.left': 'south-west',
  'ellipsis': 'more-horiz',
  'line.3.horizontal.decrease.circle': 'filter-list',
  'gearshape.fill': 'settings',
  'moon.fill': 'dark-mode',
  'bell.fill': 'notifications',
  'lock.fill': 'lock',
  'pencil': 'edit',
  'person': 'person',
  'shield': 'security',
  'globe': 'public',
  'heart': 'favorite',
  'questionmark.circle': 'help',
  'info.circle': 'info',
  'logout': 'logout',
  'settings': 'settings',
  'xmark': 'close',
  'dongsign': 'attach-money',
  'doc.text.fill': 'description',
  'calendar': 'calendar-today',
  'creditcard.fill': 'credit-card',
  'triangle.fill': 'arrow-drop-down',
  'slider.horizontal.3': 'tune',
  'sunny': 'sunny',
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  className,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
  className?: string;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} className={className} />;
}
