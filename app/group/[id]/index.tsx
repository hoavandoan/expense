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
import { ExpenseCard } from "@/components/ui/expense-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PendingSettlements } from "@/components/ui/pending-settlements";
import {
    useDebtAssignment,
    useDisableDebtAssignment,
    useGroup,
    useMembersBalance,
    useUserBalanceInGroup,
} from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { assignDebtsOptimized } from "@/lib/utils/debt-calculator";
import { formatCurrency } from "@/lib/utils/format";
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
    Tabs,
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
  const muted = useThemeColor("muted");
  const { user } = useAuthStore();
  const [assigneeSelectorVisible, setAssigneeSelectorVisible] = useState(false);
  const [createRequestVisible, setCreateRequestVisible] = useState(false);
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("expenses");
  const [showDetailedDebts, setShowDetailedDebts] = useState(false);

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
  const { data: membersData } = useMembersBalance(group);
  const membersWithBalanceRaw = membersData || [];
  const membersWithBalance = useMemo(() => {
    return membersWithBalanceRaw.map((member: any) => ({
      id: member.userId,
      name: member.name,
      avatarUrl: member.avatarUrl,
      role: member.role,
      balance: member.balance,
      userId: member.userId,
    }));
  }, [membersWithBalanceRaw]);

  // Calculate optimized debts for Summary tab
  const optimizedDebts = useMemo(() => {
    if (!membersWithBalanceRaw) return [];
    
    const balanceRecord: Record<string, number> = {};
    membersWithBalanceRaw.forEach((m: any) => {
      balanceRecord[m.userId] = m.balance;
    });
    
    return assignDebtsOptimized(balanceRecord);
  }, [membersWithBalanceRaw]);

  // Calculate total group cost
  const totalCost = useMemo(() => {
    if (!group?.expenses) return 0;
    return group.expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
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
            fromId: split.user_id,
            toId: expense.paid_by,
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

  if (isLoading || !id) {
    return (
      <View className="flex-1 bg-background p-6">
        <Skeleton className="w-full h-64 rounded-2xl mb-6" />
        <Skeleton className="w-3/4 h-8 rounded-xl mb-4" />
        <Skeleton className="w-1/2 h-6 rounded-xl mb-8" />
        <Skeleton className="w-full h-32 rounded-2xl" />
      </View>
    );
  }

  if (!group) {
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
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2">
                  <AppText className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    TỔNG CHI NHÓM
                  </AppText>
                  <View className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                    <AppText className="text-white/80 text-[10px] font-bold">NHÓM</AppText>
                  </View>
                </View>
                <AppText className="text-white text-4xl font-bold tracking-tighter" adjustsFontSizeToFit numberOfLines={1}>
                  {formatCurrency(
                    totalCost,
                    group?.currency || "VND"
                  )}
                </AppText>
              </View>

              <View className="h-[1px] bg-white/10 w-full mb-6" />

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <AppText className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                    BẠN CHI
                  </AppText>
                  <AppText className="text-white text-xl font-bold" adjustsFontSizeToFit numberOfLines={1}>
                    {formatCurrency(
                      userStats.totalPaid,
                      group?.currency || "VND"
                    )}
                  </AppText>
                </View>
                <Divider orientation="vertical" className="bg-white/20" />
                <View className="flex-1">
                  <AppText className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                    {userStats.balance >= 0 ? "BẠN NHẬN LẠI" : "BẠN NỢ"}
                  </AppText>
                  <AppText className={cn("text-xl font-bold", userStats.balance >= 0 ? "text-success" : "text-danger")} adjustsFontSizeToFit numberOfLines={1}>
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

          {/* Tabs Navigation */}
          <View className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} variant="pill">
              <Tabs.List className="bg-surface-secondary/50 p-1 rounded-2xl">
                <Tabs.ScrollView>
                  <Tabs.Indicator className="bg-background shadow-sm" />
                  <Tabs.Trigger value="expenses" className="flex-1 py-2.5 rounded-xl">
                    {({ isSelected }) => (
                      <Tabs.Label className={cn("text-sm font-bold", isSelected ? "text-foreground" : "text-muted")}>
                        Khoản chi
                      </Tabs.Label>
                    )}
                  </Tabs.Trigger>
                  <Tabs.Trigger value="summary" className="flex-1 py-2.5 rounded-xl">
                    {({ isSelected }) => (
                      <Tabs.Label className={cn("text-sm font-bold", isSelected ? "text-foreground" : "text-muted")}>
                        Tổng kết
                      </Tabs.Label>
                    )}
                  </Tabs.Trigger>
                </Tabs.ScrollView>
              </Tabs.List>

              {/* Tab Content: Expenses */}
              <Tabs.Content value="expenses" className="mt-6">
                <View className="flex-row items-center justify-between mb-6">
                  <AppText className="text-xl font-bold text-foreground">
                    Khoản chi gần đây
                  </AppText>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => router.push(`/group/${id}/expenses` as any)}
                  >
                    <Button.Label className="text-foreground font-bold text-sm">
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
                    groupData?.expenses?.slice(0, 5).map((expense: any) => (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        currency={group?.currency || "VND"}
                        memberMap={memberMap}
                        currentUserId={user?.id}
                        onPress={() => router.push(`/expense/${expense.id}` as any)}
                      />
                    ))
                  )}
                </View>
              </Tabs.Content>

              {/* Tab Content: Summary */}
              <Tabs.Content value="summary" className="mt-6">
                {/* Settlement Table */}
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-6">
                    <AppText className="text-xl font-bold text-foreground">
                      {showDetailedDebts ? "Chi tiết nợ nần" : "Đề xuất thanh toán"}
                    </AppText>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onPress={() => setShowDetailedDebts(!showDetailedDebts)}
                    >
                      <Button.Label className="text-accent font-bold text-sm">
                        {showDetailedDebts ? "Tóm tắt" : "Chi tiết"}
                      </Button.Label>
                    </Button>
                  </View>
                  
                  <View className="gap-4">
                    {showDetailedDebts ? (
                      individualDebts.length === 0 ? (
                        <View className="p-6 rounded-2xl bg-surface border border-divider/10 items-center">
                          <AppText className="text-muted">Không có khoản nợ nào</AppText>
                        </View>
                      ) : (
                        individualDebts.map((debt: any) => {
                          const fromMember = memberMap.get(debt.fromId);
                          const toMember = memberMap.get(debt.toId);
                          
                          return (
                            <Card
                              key={debt.id}
                              variant="default"
                              className="p-4 rounded-2xl bg-surface border border-divider/10"
                            >
                              <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center flex-1">
                                  <Avatar size="sm" alt={fromMember?.name || "U"} className="mr-2 size-6">
                                    {fromMember?.avatar_url && (
                                      <Avatar.Image source={{ uri: fromMember.avatar_url }} asChild>
                                        <Image source={{ uri: fromMember.avatar_url }} style={{ width: '100%', height: '100%' }} />
                                      </Avatar.Image>
                                    )}
                                    <Avatar.Fallback><AppText className="text-[8px]">{fromMember?.name?.charAt(0)}</AppText></Avatar.Fallback>
                                  </Avatar>
                                  <AppText className="font-bold text-sm">
                                    {debt.fromId === user?.id ? "Bạn" : fromMember?.name}
                                  </AppText>
                                  <AppText className="text-danger font-bold mx-1 text-[10px]">NỢ</AppText>
                                  <AppText className="font-bold text-sm">
                                    {debt.toId === user?.id ? "Bạn" : toMember?.name}
                                  </AppText>
                                </View>
                                <AppText className="font-bold text-danger">
                                  {formatCurrency(debt.amount, group?.currency || "VND")}
                                </AppText>
                              </View>
                              <View className="flex-row items-center justify-between">
                                <AppText className="text-muted text-xs italic" numberOfLines={1}>
                                  cho {debt.description}
                                </AppText>
                                <AppText className="text-muted text-[10px]">
                                  {new Date(debt.date).toLocaleDateString("vi-VN")}
                                </AppText>
                              </View>
                            </Card>
                          );
                        })
                      )
                    ) : (
                      optimizedDebts.length === 0 ? (
                        <View className="p-6 rounded-2xl bg-surface border border-divider/10 items-center">
                          <AppText className="text-muted">Tất cả nợ đã được tất toán!</AppText>
                        </View>
                      ) : (
                        optimizedDebts.map((debt, index) => {
                          const fromMember = memberMap.get(debt.from);
                          const toMember = memberMap.get(debt.to);
                        
                          return (
                            <Card
                              key={index}
                              variant="default"
                              className="p-4 rounded-2xl bg-surface border border-divider/10"
                            >
                              <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                  <View className="items-center">
                                    <Avatar size="sm" alt={fromMember?.name} className="mb-1">
                                      {fromMember?.avatar_url && (
                                        <Avatar.Image source={{ uri: fromMember.avatar_url }} asChild>
                                          <Image source={{ uri: fromMember.avatar_url }} style={{ width: '100%', height: '100%' }} />
                                        </Avatar.Image>
                                      )}
                                      <Avatar.Fallback><AppText className="text-[8px]">{fromMember?.name?.charAt(0)}</AppText></Avatar.Fallback>
                                    </Avatar>
                                    <AppText className="text-[10px] font-bold text-foreground" numberOfLines={1}>
                                      {debt.from === user?.id ? "Bạn" : fromMember?.name}
                                    </AppText>
                                  </View>
                                  
                                  <View className="flex-1 items-center px-4">
                                    <View className="w-full h-[1px] bg-divider/20 relative items-center justify-center">
                                      <View className="px-2 bg-surface">
                                        <IconSymbol name="chevron.right" size={12} color={muted} />
                                      </View>
                                    </View>
                                    <AppText className="text-xs font-bold text-accent mt-2">
                                      {formatCurrency(debt.amount, group?.currency || "VND")}
                                    </AppText>
                                  </View>

                                  <View className="items-center">
                                    <Avatar size="sm" alt={toMember?.name} className="mb-1">
                                      {toMember?.avatar_url && (
                                        <Avatar.Image source={{ uri: toMember.avatar_url }} asChild>
                                          <Image source={{ uri: toMember.avatar_url }} style={{ width: '100%', height: '100%' }} />
                                        </Avatar.Image>
                                      )}
                                      <Avatar.Fallback><AppText className="text-[8px]">{toMember?.name?.charAt(0)}</AppText></Avatar.Fallback>
                                    </Avatar>
                                    <AppText className="text-[10px] font-bold text-foreground" numberOfLines={1}>
                                      {debt.to === user?.id ? "Bạn" : toMember?.name}
                                    </AppText>
                                  </View>
                                </View>
                              </View>
                            </Card>
                          );
                        })
                      )
                    )}
                  </View>
                </View>
              </Tabs.Content>
            </Tabs>
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

