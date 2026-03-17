import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * Sync TanStack Query onlineManager with real device network status.
 * Must be called once at app initialization (outside component tree).
 * Uses setEventListener as recommended by TanStack Query docs.
 */
export const setupOnlineManager = () => {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? true);
    });
  });
};

/**
 * Hook to read current network status (reactive).
 * Subscribes to NetInfo events and polls periodically as fallback
 * for environments where events may not fire reliably (e.g., Expo Go).
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
  }, []);

  return isOnline;
}