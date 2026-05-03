'use client';

export const dynamic = 'force-dynamic';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DonorForm from '@/components/donors/DonorForm';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function AddDonorPage() {
  const router = useRouter();
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Donor registered successfully!');
    router.push('/dashboard/super-user/donors');
  };

  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Register New Donor</h1>
              <p className="text-gray-600 mb-8">Enter donor details below to add them to the system.</p>
              
              <div className="card">
                <DonorForm onSubmit={handleSuccess} />
              </div>
            </div>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}
