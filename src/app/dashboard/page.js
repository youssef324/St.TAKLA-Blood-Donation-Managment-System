'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 0) router.push('/dashboard/user');
      else if (user.role === 1) router.push('/dashboard/super-user');
      else if (user.role === 2) router.push('/dashboard/admin');
    }
  }, [user, loading, router]);

  return <LoadingSpinner text="Loading dashboard..." />;
}