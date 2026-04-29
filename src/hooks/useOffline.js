'use client';
import { useState, useEffect } from 'react';
import { hasPendingSyncs, syncDonors } from '@/lib/offlineSync';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    checkPendingSyncs();

    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingSyncs = async () => {
    const hasPending = await hasPendingSyncs();
    setPendingSyncCount(hasPending ? 1 : 0);
  };

  const syncData = async () => {
    const results = await syncDonors();
    setPendingSyncCount(0);
    return results;
  };

  return { isOnline, pendingSyncCount, syncData };
}