import { cn } from 'heroui-native';
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

interface AppTextProps extends RNTextProps {
  className?: string;
}

export const AppText = React.forwardRef<RNText, AppTextProps>((props, ref) => {
  const { className, ...restProps } = props;

  return (
    <RNText 
      ref={ref} 
      className={cn('text-foreground', className)} 
      {...restProps} 
    />
  );
});

AppText.displayName = 'AppText';