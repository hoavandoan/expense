import { cn, Surface } from 'heroui-native';
import React, { FC, PropsWithChildren } from 'react';
import { ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props extends ViewProps {
  variant?: 'default' | 'secondary' | 'tertiary' | 'transparent';
  className?: string;
}

/**
 * A standard screen container using HeroUI Native Surface and safe area insets.
 * Provides consistent padding and background while avoiding system notches.
 */
export const ScreenSurface: FC<PropsWithChildren<Props>> = ({
  children,
  variant = 'default',
  className,
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Surface 
      variant={variant} 
      className={cn('flex-1', className)} 
      style={[{ paddingTop: insets.top }, style]}
      {...props}
    >
      <Surface variant="transparent" className="flex-1 px-6">
        {children}
      </Surface>
    </Surface>
  );
};

