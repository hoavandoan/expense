import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { CARD_WIDTH, GAP, GroupCard } from "@/components/ui/group-card";
import { useTranslation } from "@/lib/hooks";
import { useRouter } from "expo-router";
import { PressableFeedback, Skeleton, useThemeColor } from "heroui-native";
import { View } from "react-native";
import Animated, {
  FadeInRight,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

interface GroupsSectionProps {
  groups: any[] | null;
  isLoading: boolean;
}

export const GroupsSection = ({ groups, isLoading }: GroupsSectionProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const accent = useThemeColor("accent");
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  if (isLoading) {
    return (
      <View className="mb-8 w-full">
        <View className="px-6 flex-row items-center justify-between mb-4">
          <Skeleton className="w-32 h-6 rounded-md" />
        </View>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: GAP }}
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ width: CARD_WIDTH, height: 160, borderRadius: 32, borderCurve: 'continuous' }} />
          ))}
        </Animated.ScrollView>
      </View>
    );
  }

  return (
    <View className="mb-8 w-full">
      <Animated.View
        entering={FadeInRight.delay(700).springify()}
        className="px-6 flex-row items-center justify-between mb-4"
      >
        <AppText className="text-xl font-bold">{t('home.groups.title')}</AppText>
        <PressableFeedback onPress={() => router.push("/groups" as any)}>
          <AppText className="text-foreground font-semibold text-sm">
            {t('home.groups.view_all')}
          </AppText>
        </PressableFeedback>
      </Animated.View>

      {groups && groups.length > 0 ? (
        <Animated.FlatList
          data={groups}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          snapToInterval={CARD_WIDTH + GAP}
          decelerationRate="fast"
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
          renderItem={({ item, index }) => (
            <GroupCard
              variant="horizontal"
              title={item.name}
              memberCount={item.memberCount || 0}
              balance={item.totalExpenses || 0}
              members={
                item.group_members?.map((m: any) => ({
                  id: m.user_id,
                  name: m.user?.name || "",
                  avatarUrl: m.user?.avatar_url,
                })) || []
              }
              bgImage={item.cover_image_url}
              onPress={() => router.push(`/group/${item.id}` as any)}
              index={index}
              scrollX={scrollX}
            />
          )}
        />
      ) : (
        <View className="mx-6">
          <EmptyState
            icon="person.3.fill"
            title={t('home.groups.empty_title')}
            description={t('home.groups.empty_description')}
            actionLabel={t('home.groups.create_group')}
            onAction={() => router.push("/add-group")}
          />
        </View>
      )}
    </View>
  );
};
