'use client';

export const dynamic = 'force-dynamic';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const toast = useToast();

  const handleClearCache = () => {
    toast.success('System cache cleared!');
  };

  const settingsGroups = [
    {
      title: 'General Settings',
      items: [
        { label: 'System Name', value: 'Blood Donation Management System', type: 'text' },
        { label: 'Timezone', value: 'Africa/Cairo (UTC+3)', type: 'text' },
        { label: 'Language', value: 'English / Arabic', type: 'text' },
      ]
    },
    {
      title: 'Security & Auth',
      items: [
        { label: 'Session Expiry', value: '4 Hours', type: 'text' },
        { label: 'Max Admins', value: '2 (Enforced)', type: 'text' },
        { label: 'JWT Encryption', value: 'Enabled (HS256)', type: 'text' },
      ]
    }
  ];

  return (
    <ProtectedRoute allowedRoles={[2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">System Settings</h1>

            <div className="max-w-4xl space-y-8">
              {settingsGroups.map((group) => (
                <div key={group.title} className="card">
                  <h3 className="text-lg font-bold border-b pb-4 mb-4">{group.title}</h3>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">{item.label}</span>
                        <span className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-mono text-gray-700">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="card border-red-100 bg-red-50/30">
                <h3 className="text-lg font-bold text-red-700 mb-4">Maintenance Actions</h3>
                <div className="flex gap-4">
                  <Button variant="secondary" onClick={handleClearCache}>
                    Clear Cache
                  </Button>
                </div>
                <p className="mt-4 text-xs text-red-500 font-medium italic">
                  Note: Some actions are limited to super-administrators.
                </p>
              </div>
            </div>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}