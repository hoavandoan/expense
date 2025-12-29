import { AppText } from '@/components/app-text';
import { Image } from 'expo-image';
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
      <PressableFeedback onPress={onPress} className='rounded-2xl w-1/2'>
        <Card variant="default" className={cn('p-0 rounded-2xl border-none shadow-sm', className)}>
          <Card.Header className="p-0 h-[140px] justify-end overflow-hidden">
            {bgImage && (
              <Image
                source={{ uri: bgImage }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            )}
            <View className="absolute inset-0 bg-black/20" />
            <Card.Title className="text-white text-lg font-bold p-4 z-10">
              {title}
            </Card.Title>
          </Card.Header>
          <Card.Body className="bg-surface flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              {members.slice(0, 3).map((member, index) => (
                <Avatar
                  key={member.id}
                  size="sm"
                  alt={member.name}
                  className={cn(index > 0 && 'rounded-full bg-surface-secondary -ml-3', 'border-2 border-surface')}
                >
                  <Avatar.Image source={{ uri: member.avatarUrl }} />
                  <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
                </Avatar>
              ))}
              {memberCount > 3 && (
                <View className="w-8 h-8 rounded-full bg-surface-secondary border-2 border-surface items-center justify-center -ml-3">
                  <AppText className="text-[10px] text-muted font-bold">+{memberCount - 3}</AppText>
                </View>
              )}
            </View>
            <View className="items-end">
              <AppText className="text-muted text-[10px] uppercase font-bold">BẠN ĐƯỢC TRẢ</AppText>
              <AppText className={cn('font-bold', balanceColor)}>{balanceText}</AppText>
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
                className={cn(index > 0 && 'rounded-full bg-surface-secondary -ml-3', 'border-2 border-surface')}
              >
                {member.avatarUrl ? (
                  <Avatar.Image source={{ uri: member.avatarUrl }} />
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
