'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending offline data
    checkPendingSyncs();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingSyncs = () => {
    try {
      const data = JSON.parse(localStorage.getItem('offline_donors') || '[]');
      setPendingSyncs(data.length);
    } catch (error) {
      console.error('Error checking pending syncs:', error);
    }
  };

  const syncOfflineData = async () => {
    const offlineData = JSON.parse(localStorage.getItem('offline_donors') || '[]');
    
    if (offlineData.length === 0) return;

    setSyncing(true);
    let synced = 0;

    for (const data of offlineData) {
      try {
        const res = await fetch('/api/donors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) synced++;
      } catch (error) {
        console.error('Sync failed for donor:', data.phone_number);
      }
    }

    // Clear synced data
    localStorage.removeItem('offline_donors');
    setPendingSyncs(0);
    setSyncing(false);

    if (synced > 0) {
      toast.success(`✅ Synced ${synced} donor(s) successfully!`);
    }
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 bg-yellow-500 text-white z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>📡</span>
              <span className="font-medium">You are offline</span>
              {pendingSyncs > 0 && (
                <span className="text-sm">({pendingSyncs} pending syncs)</span>
              )}
            </div>
            {pendingSyncs > 0 && isOnline && (
              <button
                onClick={syncOfflineData}
                disabled={syncing}
                className="bg-white text-yellow-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-50 disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {isOnline && pendingSyncs > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg z-50"
        >
          <div className="flex items-center gap-2">
            <span>✅ Back online!</span>
            <button
              onClick={syncOfflineData}
              disabled={syncing}
              className="underline font-medium"
            >
              {syncing ? 'Syncing...' : `Sync ${pendingSyncs} donor(s)`}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}