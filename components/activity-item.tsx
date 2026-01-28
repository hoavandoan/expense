import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Avatar, cn, PressableFeedback, useThemeColor } from "heroui-native";
import React from "react";
import { View } from "react-native";

export interface ActivityItemProps {
  user: { name: string; avatar: string };
  action: string;
  subject?: string;
  group: string;
  groupIcon: any;
  amount?: string;
  status?: string;
  typeIcon: any;
  typeColor: string;
  iconColor: string;
  isMe?: boolean;
}

export const ActivityItem = ({
                               user,
                               action,
                               subject,
                               group,
                               groupIcon,
                               amount,
                               status,
                               typeIcon,
                               typeColor,
                               iconColor,
                               isMe,
                             }: ActivityItemProps) => {
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");

  return (
    <PressableFeedback className="bg-surface p-4 rounded-2xl border border-divider/10">
      <View className="flex-row items-center">
        <View className="relative">
          <Avatar size="lg" alt={user.name} className="w-14 h-14">
            {isMe ? (
              <View className="w-full h-full bg-accent-soft items-center justify-center">
                <AppText className="text-accent font-bold text-xs uppercase">
                  Bạn
                </AppText>
              </View>
            ) : user.avatar ? (
              <Avatar.Image source={{ uri: user.avatar }} />
            ) : (
              <Avatar.Fallback className="bg-surface-secondary">
                {user.name.charAt(0)}
              </Avatar.Fallback>
            )}
          </Avatar>
          <View
            className={cn(
              "absolute w-6 h-6 bottom-0 right-0 rounded-full items-center justify-center border-2 border-surface shadow-lg",
              typeColor
            )}
          >
            <IconSymbol name={typeIcon} size={10} color={iconColor} />
          </View>
        </View>

        <View className="flex-1 ml-4 justify-center">
          <AppText className="text-base text-foreground leading-tight">
            <AppText className="font-bold">{user.name}</AppText>
            <AppText className="text-foreground/70"> {action}</AppText>
            {subject && (
              <AppText className="text-foreground font-semibold">
                {" "}
                {subject}
              </AppText>
            )}
          </AppText>
          <View className="flex-row items-center mt-1">
            <IconSymbol name={groupIcon} size={14} color={muted} />
            <AppText className="text-muted text-xs ml-1 font-medium">
              {group}
            </AppText>
          </View>
        </View>

        <View className="items-end justify-center">
          {amount && (
            <AppText
              className={cn(
                "text-lg font-bold",
                amount.startsWith("+")
                  ? "text-success"
                  : status
                    ? "text-accent"
                    : "text-foreground"
              )}
            >
              {amount}
            </AppText>
          )}
          {status && (
            <AppText className="text-muted text-[11px] font-medium">
              {status}
            </AppText>
          )}
        </View>
      </View>
    </PressableFeedback>
  );
};
