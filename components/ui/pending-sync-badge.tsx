import { useMutationState } from '@tanstack/react-query';
import { Chip } from 'heroui-native';
import { RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/lib/hooks/use-translation';

/**
 * Badge showing the count of pending (paused) mutations waiting to sync.
 * Uses HeroUI Chip component. Only visible when there are pending mutations.
 */
export function PendingSyncBadge() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => mutation.state.status,
  });

  const pendingCount = pendingMutations.length;

  if (pendingCount === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="absolute z-50 self-center"
      style={{ bottom: insets.bottom + 64 }}
      pointerEvents="none"
    >
      <Chip variant="primary" color="warning" size="md" className="shadow-lg">
        <RefreshCw size={14} className="text-warning-foreground animate-spin" />
        <Chip.Label className="text-warning-foreground font-medium">
          {t('offline.pendingSync', { count: pendingCount })}
        </Chip.Label>
      </Chip>
    </Animated.View>
  );
}
