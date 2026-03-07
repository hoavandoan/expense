import { cn, Surface } from 'heroui-native';
import React, { FC, PropsWithChildren } from 'react';
import { ViewProps } from 'react-native';

interface Props extends ViewProps {
  variant?: 'default' | 'secondary' | 'tertiary' | 'transparent';
  className?: string;
}

/**
 * A standard screen container using HeroUI Native Surface and SafeAreaView.
 * Provides consistent padding and background.
 */
export const ScreenSurface: FC<PropsWithChildren<Props>> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <Surface variant={variant} className={cn('flex-1', className)} {...props}>
      <Surface variant="transparent" className="flex-1 px-6">
        {children}
      </Surface>
    </Surface>
  );
};

