import { cn } from 'heroui-native';
import React, { FC } from 'react';
import { Text, View } from 'react-native';

interface TimelineItemProps {
  title: string;
  subtitle: string;
  amount: number;
  isLast?: boolean;
  className?: string;
}

export const TimelineItem: FC<TimelineItemProps> = ({
  title,
  subtitle,
  amount,
  isLast = false,
  className,
}) => {
  const isPositive = amount >= 0;
  const amountColor = isPositive ? 'text-success' : 'text-danger';
  const amountText = `${isPositive ? '+' : ''}${amount.toLocaleString()}đ`;

  return (
    <View className={cn('flex-row', className)}>
      <View className="items-center mr-4">
        <View className="w-3 h-3 rounded-full bg-accent mt-1.5" />
        {!isLast && <View className="w-0.5 flex-1 bg-divider my-1" />}
      </View>

      <View className="flex-1 pb-6">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-foreground font-semibold text-base">{title}</Text>
            <Text className="text-muted text-sm">{subtitle}</Text>
          </View>
          <Text className={cn('font-bold text-base', amountColor)}>
            {amountText}
          </Text>
        </View>
      </View>
    </View>
  );
};
