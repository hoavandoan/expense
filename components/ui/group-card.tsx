import { AppText } from '@/components/app-text';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar, Card, cn, PressableFeedback } from 'heroui-native';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

interface Member {
  id: string;
  avatarUrl?: string;
  name: string;
}

interface GroupCardProps {
  title: string;
  memberCount: number;
  balance: number;
  members: Member[];
  className?: string;
  onPress?: () => void;
  variant?: 'default' | 'horizontal';
  bgImage?: string;
}

export const GroupCard: FC<GroupCardProps> = ({
  title,
  memberCount,
  balance,
  members,
  className,
  onPress,
  variant = 'default',
  bgImage,
}) => {
  const isPositive = balance >= 0;
  const balanceText = isPositive
    ? `+${(balance / 1000).toFixed(0)}k`
    : `-${(Math.abs(balance) / 1000).toFixed(0)}k`;

  const balanceColor = isPositive ? 'text-success' : 'text-danger';

  if (variant === 'horizontal') {
    return (
      <PressableFeedback onPress={onPress} className='w-1/2 bg-accent-soft rounded-2xl'>
        <Card variant="default" className={cn('relative p-0 w-full rounded-2xl border-none shadow-sm', className)}>
          {bgImage && (
            <Image
              source={{ uri: bgImage }}
              contentFit="cover"
              className='absolute h-[140px] w-full'
            />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']}
            style={StyleSheet.absoluteFill}
            className='w-full'
          />
          <Card.Body className="flex-row items-center justify-between p-4 gap-2 w-full">
            <View className="flex-row items-center">
              {members.slice(0, 3).map((member, index) => (
                <Avatar
                  key={member.id}
                  size="sm"
                  alt={member.name}
                  className={cn('w-8 h-8', index > 0 && '-ml-4', 'rounded-full')}
                >
                  <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                    <Image source={{ uri: member.avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit='cover' />
                  </Avatar.Image>
                  <Avatar.Fallback className="w-8 h-8">{member.name.charAt(0)}</Avatar.Fallback>
                </Avatar>
              ))}
              {memberCount > 3 && (
                <View className="w-8 h-8 rounded-full bg-surface-secondary border-2 border-surface items-center justify-center -ml-3">
                  <AppText className="text-[10px] text-muted font-bold">+{memberCount - 3}</AppText>
                </View>
              )}
            </View>
            <View className="items-end flex-shrink-0">
              <AppText className="text-muted text-[8px] uppercase font-bold" numberOfLines={1}>BẠN ĐƯỢC TRẢ</AppText>
              <AppText className={cn('font-bold text-sm', balanceColor)} numberOfLines={1}>{balanceText}</AppText>
            </View>
          </Card.Body>
        </Card>
      </PressableFeedback>
    );
  }

  const balanceDisplay = isPositive
    ? `Bạn được trả: ${balance.toLocaleString()}đ`
    : `Bạn nợ: ${Math.abs(balance).toLocaleString()}đ`;

  const Content = (
    <Card variant="default" className={cn('mb-4 p-4', className)}>
      <Card.Body className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Card.Title className="text-lg font-bold mb-1">{title}</Card.Title>
          <Card.Description className="text-muted text-sm mb-2">
            {memberCount} thành viên
          </Card.Description>

          <View className="flex-row items-center">
            {members.slice(0, 4).map((member, index) => (
              <Avatar
                key={member.id}
                size="sm"
                alt={member.name}
                className={cn(index !== 0 && '-ml-3', 'border-background border-[2px]')}
              >
                {member.avatarUrl ? (
                  <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                    <Image source={{ uri: member.avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit='cover' />
                  </Avatar.Image>
                ) : (
                  <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
                )}
              </Avatar>
            ))}
            {memberCount > 4 && (
              <Avatar
                size="sm"
                alt="More members"
                className="-ml-3 border-2 border-surface"
              >
                <Avatar.Fallback>+{memberCount - 4}</Avatar.Fallback>
              </Avatar>
            )}
          </View>
        </View>

        <View className="items-end">
          <Card.Description className={cn('font-semibold', balanceColor)}>
            {balanceDisplay}
          </Card.Description>
        </View>
      </Card.Body>
    </Card>
  );

  if (onPress) {
    return (
      <PressableFeedback onPress={onPress}>{Content}</PressableFeedback>
    );
  }

  return Content;
};
