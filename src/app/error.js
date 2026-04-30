'use client';
import { useEffect } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Button from '@/components/ui/Button';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <AnimatedPage className="max-w-md w-full text-center space-y-6">
        <div className="text-8xl mb-4">⚠️</div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Something went wrong!</h1>
          <p className="text-gray-600">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl text-left">
          <p className="text-xs font-mono text-red-600 break-all">
            {error.message || 'Unknown error'}
          </p>
        </div>
        <div className="pt-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/'}>
            Home
          </Button>
          <Button className="flex-1" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </AnimatedPage>
    </div>
  );
}
