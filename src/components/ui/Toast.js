'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function Toast() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`px-6 py-3 rounded-xl shadow-2xl text-white flex items-center gap-3 min-w-[320px] backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : toast.type === 'warning'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
          >
            <span className="text-xl">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            <p className="font-medium">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}