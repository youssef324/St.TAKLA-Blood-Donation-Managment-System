'use client';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={[2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}