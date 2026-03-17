import { useToast } from 'heroui-native';
import { WifiOff } from 'lucide-react-native';
import { useEffect } from 'react';

import { useNetworkStatus } from '@/lib/hooks/use-network-status';
import { useTranslation } from '@/lib/hooks/use-translation';

/**
 * Persistent banner displayed at the top of the screen when the device is offline.
 * Uses HeroUI Toast component with warning variant.
 */
export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    const TOAST_ID = 'offline-banner-toast';

    if (!isOnline) {
      toast.show({
        id: TOAST_ID,
        variant: 'warning',
        placement: 'top',
        duration: 'persistent',
        isSwipeable: false,
        label: t('offline.banner'),
        description: t('offline.bannerSubtitle'),
        icon: <WifiOff size={18} className="text-warning-foreground" />,
      });
    } else {
      toast.hide(TOAST_ID);
    }

    return () => {
      toast.hide(TOAST_ID);
    };
  }, [isOnline, t, toast]);

  return null;
}
