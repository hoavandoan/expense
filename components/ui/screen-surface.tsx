import { Surface } from 'heroui-native';
import React, { FC, PropsWithChildren } from 'react';
import { SafeAreaView, ViewProps } from 'react-native';

interface Props extends ViewProps {
  variant?: 'default' | 'secondary' | 'tertiary' | 'quaternary' | 'transparent';
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
    <Surface variant={variant} className="flex-1" {...props}>
      <SafeAreaView className="flex-1">
        <Surface variant="transparent" className="flex-1 p-4">
          {children}
        </Surface>
      </SafeAreaView>
    </Surface>
  );
};
