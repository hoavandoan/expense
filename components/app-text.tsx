import { cn } from 'heroui-native';
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

interface AppTextProps extends RNTextProps {
  className?: string;
  variant?: 'body' | 'heading';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const AppText = React.forwardRef<RNText, AppTextProps>((props, ref) => {
  const { className, variant = 'body', weight = 'normal', ...restProps } = props;

  const fontClass = React.useMemo(() => {
    const isHeading = variant === 'heading';
    const prefix = isHeading ? 'font-heading' : 'font';
    return `${prefix}-${weight}`;
  }, [variant, weight]);

  return (
    <RNText 
      ref={ref} 
      className={cn(fontClass, 'text-foreground', className)} 
      {...restProps} 
    />
  );
});

AppText.displayName = 'AppText';