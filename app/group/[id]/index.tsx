import { AppText } from "@/components/app-text";
import { ErrorState } from "@/components/ui/error-state";

import { AssigneeSelector } from "@/components/debt-assignment/assignee-selector";
import { CreateRequestModal } from "@/components/debt-assignment/create-request-modal";
import { PendingRequestsList } from "@/components/debt-assignment/pending-requests-list";
import {
  AnimatedScrollView,
  AnimatedScrollViewTitle,
  AnimatedScrollViewTitleWrapper,
  HeaderComponentWrapper,
  HeaderNavBar,
} from "@/components/parallax-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PendingSettlements } from "@/components/ui/pending-settlements";
import { type TimelineItem } from "@/components/ui/timeline";
import {
  useDebtAssignment,
  useDisableDebtAssignment,
  useGroup,
  useMembersBalance,
  useUserBalanceInGroup,
} from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  cn,
  Divider,
  PressableFeedback,
  Skeleton,
  useThemeColor,
} from "heroui-native";
import React, { useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";

interface MemberWithBalance {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  balance: number;
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor("accent");
  const { user } = useAuthStore();
  const [assigneeSelectorVisible, setAssigneeSelectorVisible] = useState(false);
  const [createRequestVisible, setCreateRequestVisible] = useState(false);
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);

  const {
    data: group,
    isLoading,
    refetch,
    isRefetching,
  } = useGroup(id as string);

  const { data: activeAssignment } = useDebtAssignment(id as string);
  const { mutate: disableAssignment, isPending: isDisablingAssignment } = useDisableDebtAssignment();

  // Calculate user's balance in this group
  const userStats = useUserBalanceInGroup(group, user?.id || null);

  // Transform members with balance calculation
  const membersWithBalanceRaw = useMembersBalance(group);
  const membersWithBalance = useMemo(() => {
    return membersWithBalanceRaw.map((member) => ({
      id: member.userId,
      name: member.name,
      avatarUrl: member.avatarUrl,
      role: member.role,
      balance: member.balance,
      userId: member.userId,
    }));
  }, [membersWithBalanceRaw]);

  // Transform expenses to activity timeline
  const activities: TimelineItem[] = useMemo(() => {
    if (!group?.expenses) return [];

    return group.expenses.slice(0, 5).map((expense: any, index: number) => ({
      id: expense.id,
      title: `${expense.paid_by_user?.name || "Ai đó"} đã thêm ${
        expense.title
      }`,
      description: expense.description || undefined,
      timestamp: new Date(expense.created_at).toLocaleDateString("vi-VN"),
      icon: getCategoryIcon(expense.category),
      status: index === 0 ? "current" : "complete",
      meta: formatCurrency(expense.amount, group.currency || "VND"),
    }));
  }, [group]);

  const memberMap = useMemo(() => {
    const map = new Map<string, any>();
    const groupData = group as any;
    groupData?.group_members?.forEach((m: any) => {
      map.set(m.user_id, m.user);
    });
    return map;
  }, [group]);

  const individualDebts = useMemo(() => {
    const groupData = group as any;
    if (!groupData?.expenses) return [];

    const debts: any[] = [];
    groupData.expenses.forEach((expense: any) => {
      const payer = memberMap.get(expense.paid_by);
      expense.expense_splits?.forEach((split: any) => {
        // Only show debts where the user is not the payer
        if (split.user_id !== expense.paid_by) {
          debts.push({
            id: split.id,
            from: memberMap.get(split.user_id),
            to: payer,
            amount: split.amount,
            description: expense.title,
            date: expense.created_at,
          });
        }
      });
    });
    // Sort by date descending
    return debts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [group, memberMap]);

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDisableAssignment = () => {
    if (activeAssignment?.id) {
      disableAssignment(id as string);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-6">
        <Skeleton className="w-full h-64 rounded-2xl mb-6" />
        <Skeleton className="w-3/4 h-8 rounded-xl mb-4" />
        <Skeleton className="w-1/2 h-6 rounded-xl mb-8" />
        <Skeleton className="w-full h-32 rounded-2xl" />
      </View>
    );
  }

  if (!group && !isLoading) {
    return (
      <View className="flex-1 bg-background">
        <ErrorState
          title="Không tìm thấy nhóm"
          message="Nhóm này không tồn tại hoặc bạn không có quyền truy cập"
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const groupData = group as any;
  const coverImage =
    groupData?.cover_image_url ||
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000";

  const isOwnerOrAdmin = groupData?.group_members?.some(
    (m: any) => m.user_id === user?.id && (m.role === 'owner' || m.role === 'admin')
  );

  const assigneeUser = activeAssignment && groupData?.group_members?.find(
      (m: any) => m.user_id === activeAssignment.assigneeUserId
  )?.user;

  return (
    <View className="flex-1 bg-black">
      <AnimatedScrollView
        showsVerticalScrollIndicator={false}
        headerMaxHeight={300}
        topBarHeight={100}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        renderHeaderNavBarComponent={() => (
          <HeaderNavBar className="bg-transparent">
            <View className="flex-row items-center justify-between h-full w-full">
              <Button
                isIconOnly
                variant="ghost"
                className="w-10 h-10 bg-black/20 border border-white/10"
                onPress={() => router.back()}
              >
                <IconSymbol name="chevron.left" size={24} color="white" />
              </Button>
              <View className="flex-row gap-2">
                <Button
                  isIconOnly
                  variant="ghost"
                  className="w-10 h-10 bg-black/20 border border-white/10"
                >
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={18}
                    color="white"
                  />
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  className="w-10 h-10 bg-black/20 border border-white/10"
                  onPress={() => router.push(`/group/${id}/settings`)}
                >
                  <IconSymbol name="gearshape.fill" size={20} color="white" />
                </Button>
              </View>
            </View>
          </HeaderNavBar>
        )}
        renderTopNavBarComponent={() => (
          <HeaderNavBar useBlur={true}>
            <View className="flex-row items-center h-full w-full">
              <View className="flex-1 items-start">
                <Button
                  isIconOnly
                  variant="ghost"
                  className="w-10 h-10 bg-black/20 border border-white/10"
                  onPress={() => router.back()}
                >
                  <IconSymbol name="chevron.left" size={24} color="white" />
                </Button>
              </View>
              <View className="flex-2 items-center">
                <AppText className="text-white text-lg font-bold">
                  {group?.name}
                </AppText>
              </View>
              <View className="flex-1 items-end">
                <Button
                  isIconOnly
                  variant="ghost"
                  className="w-10 h-10 bg-black/20 border border-white/10"
                  onPress={() => router.push(`/group/${id}/settings`)}
                >
                  <IconSymbol name="ellipsis" size={20} color="white" />
                </Button>
              </View>
            </View>
          </HeaderNavBar>
        )}
        renderOveralComponent={() => (
          <AnimatedScrollViewTitleWrapper className="px-6 pb-6">
            <AnimatedScrollViewTitle
              size={42}
              className="text-white font-bold tracking-tighter"
            >
              {group?.name}
            </AnimatedScrollViewTitle>
          </AnimatedScrollViewTitleWrapper>
        )}
        renderHeaderComponent={() => (
          <HeaderComponentWrapper
            useGradient
            gradientColors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,1)"]}
            gradientHeight={200}
          >
            <Image
              source={{ uri: coverImage }}
              style={{ width: "100%", height: 300 }}
              contentFit="cover"
            />
          </HeaderComponentWrapper>
        )}
      >
        <View className="px-6 pt-4 bg-background">
          {/* Info Badges */}
          <View className="flex-row gap-3 mb-8">
            <View className="bg-surface-secondary px-4 py-2 rounded-full border border-divider/10">
              <AppText className="text-muted text-[10px] font-bold uppercase tracking-widest">
                THÀNH VIÊN: {groupData?.group_members?.length || 0}
              </AppText>
            </View>
            <View
              className={cn(
                "px-4 py-2 rounded-full border",
                userStats.balance >= 0
                  ? "bg-success/10 border-success/20"
                  : "bg-danger/10 border-danger/20"
              )}
            >
              <AppText
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  userStats.balance >= 0 ? "text-success" : "text-danger"
                )}
              >
                {userStats.balance >= 0 ? "BẠN NHẬN LẠI" : "BẠN NỢ"}:{" "}
                {formatCurrency(
                  Math.abs(userStats.balance),
                  group?.currency || "VND"
                )}
              </AppText>
            </View>
          </View>

          {/* Stats Card */}
          <View className="mb-10">
            <Card
              variant="default"
              className="p-8 rounded-2xl shadow-xl overflow-hidden bg-accent"
            >
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <AppText className="text-danger text-[10px] font-bold uppercase tracking-widest mb-1">
                    BẠN CHI
                  </AppText>
                  <AppText className="text-white text-xl font-bold">
                    {formatCurrency(
                      userStats.totalPaid,
                      group?.currency || "VND"
                    )}
                  </AppText>
                </View>
                <Divider orientation="vertical" className="bg-white/20" />
                <View className="flex-1">
                  <AppText className="text-success text-[10px] font-bold uppercase tracking-widest mb-1">
                    {userStats.balance >= 0 ? "BẠN NHẬN LẠI" : "BẠN NỢ"}
                  </AppText>
                  <AppText className="text-white text-xl font-bold">
                    {formatCurrency(
                      Math.abs(userStats.balance),
                      group?.currency || "VND"
                    )}
                  </AppText>
                </View>
              </View>

              <View className="mt-8 flex-row gap-2">
                <PressableFeedback
                  className="flex-1"
                  onPress={() =>
                    router.push(`/(modal)/add-expense?groupId=${id}` as any)
                  }
                >
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="plus" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">
                      CHI TIÊU
                    </AppText>
                  </View>
                </PressableFeedback>
                <PressableFeedback
                  className="flex-1"
                  onPress={() =>
                    router.push(`/(modal)/settle-up?groupId=${id}` as any)
                  }
                >
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="qrcode" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">
                      TẤT TOÁN
                    </AppText>
                  </View>
                </PressableFeedback>
                <PressableFeedback
                  className="flex-1"
                  onPress={() => router.push(`/group/${id}/stats`)}
                >
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="chart.bar.fill" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">
                      BÁO CÁO
                    </AppText>
                  </View>
                </PressableFeedback>
              </View>
            </Card>
          </View>

          {/* Pending Settlements */}
          <PendingSettlements groupId={id as string} />
          
          {/* Assignment Requests (Shown to Admin/Owner) */}
          {isOwnerOrAdmin && (
            <PendingRequestsList 
                groupId={id as string} 
                isAdminOrOwner={isOwnerOrAdmin} 
            />
          )}

          {/* Debt Assignment Status / Controls */}
          {(isOwnerOrAdmin || activeAssignment?.status === 'active') && (
            <View className="mb-8">
               <View className="flex-row items-center justify-between mb-3">
                 <AppText className="text-xl font-bold text-foreground">
                   Gán Nợ Trung Gian
                 </AppText>
                 {isOwnerOrAdmin && activeAssignment?.status === 'active' && (
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onPress={() => setIsDisableConfirmOpen(true)}
                        isDisabled={isDisablingAssignment}
                    >
                        <Button.Label className="text-danger font-bold text-xs">Tắt tính năng</Button.Label>
                    </Button>
                 )}
               </View>

               <Card className="p-4 rounded-2xl bg-surface border border-divider/10">
                 {activeAssignment?.status === 'active' ? (
                   <View className="flex-row items-center">
                     <Avatar size="md" className="mr-3" alt={assigneeUser?.name || 'Assignee'}>
                        {assigneeUser?.avatar_url ? (
                           <Avatar.Image source={{ uri: assigneeUser.avatar_url }} asChild>
                              <Image source={{ uri: assigneeUser.avatar_url }} style={{ width: '100%', height: '100%' }} />
                           </Avatar.Image>
                        ) : (
                           <Avatar.Fallback className="bg-primary/20">
                              <AppText className="font-bold text-primary">{assigneeUser?.name?.charAt(0)}</AppText>
                           </Avatar.Fallback>
                        )}
                     </Avatar>
                     <View className="flex-1">
                       <AppText className="font-bold">{assigneeUser?.name || 'Unknown'}</AppText>
                       <AppText className="text-xs text-muted">Đang nhận tất cả khoản nợ</AppText>
                     </View>
                     {isOwnerOrAdmin && (
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            onPress={() => setAssigneeSelectorVisible(true)}
                        >
                            <Button.Label className="text-primary font-bold">Thay đổi</Button.Label>
                        </Button>
                     )}
                   </View>
                 ) : (
                   <View className="flex-row items-center justify-between">
                     <View>
                        <AppText className="font-semibold text-muted">Chưa gán người nhận nợ</AppText>
                        <AppText className="text-xs text-muted mt-1">Gán một người để đơn giản hóa việc trả nợ</AppText>
                     </View>
                     {isOwnerOrAdmin ? (
                        <Button 
                            size="sm" 
                            variant="primary" 
                            onPress={() => setAssigneeSelectorVisible(true)}
                        >
                            <Button.Label className="text-white font-bold">Thiết lập</Button.Label>
                        </Button>
                     ) : (
                        <Button 
                            size="sm" 
                            variant="ghost"
                            onPress={() => setCreateRequestVisible(true)}
                        >
                             <Button.Label className="text-primary font-bold">Đề xuất</Button.Label>
                        </Button>
                     )}
                   </View>
                 )}
               </Card>
            </View>
          )}

          {/* Debts List */}
          <View className="mb-10">
            <View className="flex-row items-center justify-between mb-6">
              <AppText className="text-xl font-bold text-foreground">
                Ai nợ ai
              </AppText>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => router.push(`/group/${id}/members`)}
              >
                <Button.Label className="text-accent font-bold text-sm">
                  Thành viên
                </Button.Label>
              </Button>
            </View>

            <View className="gap-3">
              {individualDebts.length === 0 ? (
                <View className="p-6 rounded-2xl bg-surface border border-divider/10 items-center">
                  <AppText className="text-muted">Chưa có khoản nợ nào</AppText>
                </View>
              ) : (
                individualDebts.slice(0, 6).map((debt: any) => (
                  <Card
                    key={debt.id}
                    variant="default"
                    className="p-4 rounded-2xl bg-surface border border-divider/10"
                  >
                    <View className="flex-row items-center">
                      <Avatar
                        size="sm"
                        alt={debt.from?.name || "N"}
                        className="mr-3"
                      >
                        {debt.from?.avatar_url || debt.from?.avatarUrl ? (
                          <Avatar.Image
                            source={{
                              uri: debt.from.avatar_url || debt.from.avatarUrl,
                            }}
                            asChild
                          >
                            <Image
                              source={{
                                uri:
                                  debt.from.avatar_url || debt.from.avatarUrl,
                              }}
                              style={{ width: "100%", height: "100%" }}
                            />
                          </Avatar.Image>
                        ) : (
                          <Avatar.Fallback className="bg-danger/10">
                            <AppText className="font-bold text-danger text-xs">
                              {debt.from?.name?.charAt(0) || "N"}
                            </AppText>
                          </Avatar.Fallback>
                        )}
                      </Avatar>

                      <View className="flex-1">
                        <View className="flex-row items-center flex-wrap">
                          <AppText className="font-bold text-sm text-foreground">
                            {debt.from?.id === user?.id
                              ? "Bạn"
                              : debt.from?.name || "Ai đó"}
                          </AppText>
                          <AppText className="text-muted mx-1 text-[10px] uppercase font-bold">
                            NỢ
                          </AppText>
                          <AppText className="font-bold text-sm text-foreground">
                            {debt.to?.id === user?.id
                              ? "Bạn"
                              : debt.to?.name || "Ai đó"}
                          </AppText>
                        </View>
                        <AppText
                          className="text-muted text-[10px] mt-0.5"
                          numberOfLines={1}
                        >
                          {debt.description}
                        </AppText>
                      </View>

                      <View className="items-end ml-2">
                        <AppText className="font-bold text-sm text-danger">
                          {formatCurrency(
                            debt.amount,
                            group?.currency || "VND"
                          )}
                        </AppText>
                        <AppText className="text-[9px] text-muted">
                          {new Date(debt.date).toLocaleDateString("vi-VN")}
                        </AppText>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>
          </View>

          {/* Expenses List */}
          <View className="mb-10">
            <View className="flex-row items-center justify-between mb-6">
              <AppText className="text-xl font-bold text-foreground">
                Khoản chi
              </AppText>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => router.push(`/group/${id}/expenses` as any)}
              >
                <Button.Label className="text-accent font-bold text-sm">
                  Xem tất cả
                </Button.Label>
              </Button>
            </View>

            <View className="gap-4">
              {groupData?.expenses?.length === 0 ? (
                <View className="p-6 rounded-2xl bg-surface border border-divider/10 items-center">
                  <AppText className="text-muted">Chưa có khoản chi nào</AppText>
                </View>
              ) : (
                groupData?.expenses?.slice(0, 5).map((expense: any) => {
                  const payer = memberMap.get(expense.paid_by);
                  const participants = expense.expense_splits?.map((split: any) =>
                    memberMap.get(split.user_id)
                  ).filter(Boolean) || [];

                  return (
                    <Card
                      key={expense.id}
                      variant="default"
                      className="p-4 rounded-2xl bg-surface border border-divider/10"
                    >
                      <PressableFeedback
                        onPress={() =>
                          router.push(`/expense/${expense.id}` as any)
                        }
                      >
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-3">
                              <IconSymbol
                                name={getCategoryIcon(expense.category) as any}
                                size={20}
                                color={accent}
                              />
                            </View>
                            <View className="flex-1">
                              <AppText
                                className="font-bold text-base text-foreground"
                                numberOfLines={1}
                              >
                                {expense.title}
                              </AppText>
                              <AppText className="text-muted text-[10px] uppercase font-bold mt-0.5">
                                {new Date(
                                  expense.expense_date || expense.created_at
                                ).toLocaleDateString("vi-VN")}
                              </AppText>
                            </View>
                          </View>
                          <View className="items-end">
                            <AppText className="font-bold text-base text-foreground">
                              {formatCurrency(
                                expense.amount,
                                group?.currency || "VND"
                              )}
                            </AppText>
                          </View>
                        </View>

                        <Divider className="bg-divider/5 mb-3" />

                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Avatar
                              size="sm"
                              alt={payer?.name || "P"}
                              className="mr-2 w-6 h-6"
                            >
                              {payer?.avatar_url ? (
                                <Avatar.Image
                                  source={{ uri: payer.avatar_url }}
                                  asChild
                                >
                                  <Image
                                    source={{ uri: payer.avatar_url }}
                                    style={{ width: "100%", height: "100%" }}
                                  />
                                </Avatar.Image>
                              ) : (
                                <Avatar.Fallback className="bg-accent/10">
                                  <AppText className="font-bold text-accent text-[8px]">
                                    {payer?.name?.charAt(0) || "P"}
                                  </AppText>
                                </Avatar.Fallback>
                              )}
                            </Avatar>
                            <AppText className="text-xs text-muted">
                              Trả bởi{" "}
                              <AppText className="text-foreground font-semibold">
                                {expense.paid_by === user?.id
                                  ? "Bạn"
                                  : payer?.name || "Ai đó"}
                              </AppText>
                            </AppText>
                          </View>

                          <View className="flex-row items-center">
                            {participants.slice(0, 3).map((p: any, index: number) => (
                              <Avatar
                                key={p.id + index}
                                size="sm"
                                alt={p.name}
                                className={cn(
                                  index !== 0 && "-ml-2",
                                  "border-2 border-surface w-5 h-5"
                                )}
                              >
                                {p.avatar_url ? (
                                  <Avatar.Image
                                    source={{ uri: p.avatar_url }}
                                    asChild
                                  >
                                    <Image
                                      source={{ uri: p.avatar_url }}
                                      style={{ width: "100%", height: "100%" }}
                                    />
                                  </Avatar.Image>
                                ) : (
                                  <Avatar.Fallback className="bg-surface-tertiary">
                                    <AppText className="text-[8px] font-bold">
                                      {p.name?.charAt(0)}
                                    </AppText>
                                  </Avatar.Fallback>
                                )}
                              </Avatar>
                            ))}
                            {participants.length > 3 && (
                              <View className="w-5 h-5 rounded-full bg-surface-tertiary border-2 border-surface items-center justify-center -ml-2">
                                <AppText className="text-[8px] font-bold text-muted">
                                  +{participants.length - 3}
                                </AppText>
                              </View>
                            )}
                          </View>
                        </View>
                      </PressableFeedback>
                    </Card>
                  );
                })
              )}
            </View>
          </View>
        </View>
      </AnimatedScrollView>
      
      {/* Modals */}
      <AssigneeSelector
        isVisible={assigneeSelectorVisible}
        onClose={() => setAssigneeSelectorVisible(false)}
        groupId={id as string}
        members={membersWithBalance}
        currentAssigneeId={activeAssignment?.assigneeUserId}
      />
      
      <CreateRequestModal
        isVisible={createRequestVisible}
        onClose={() => setCreateRequestVisible(false)}
        groupId={id as string}
        members={membersWithBalance}
        currentUserId={user?.id || ''}
      />

      <ConfirmDialog
        isOpen={isDisableConfirmOpen}
        onOpenChange={setIsDisableConfirmOpen}
        title="Tắt Gán Nợ Trung Gian"
        description="Bạn có chắc chắn muốn tắt tính năng này? Các khoản nợ sẽ được tính toán lại theo cách tối ưu hóa thông thường."
        confirmLabel="Tắt"
        cancelLabel="Hủy"
        onConfirm={handleDisableAssignment}
        variant="danger"
        isLoading={isDisablingAssignment}
      />
    </View>
  );
}

function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    food: "fork.knife",
    transport: "car.fill",
    shopping: "cart.fill",
    entertainment: "gamecontroller.fill",
    utilities: "bolt.fill",
    accommodation: "house.fill",
    other: "ellipsis.circle.fill",
  };
  return iconMap[category] || "doc.text.fill";
}
