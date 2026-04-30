'use client';
import { useState } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DonorTable from '@/components/donors/DonorTable';
import DonationForm from '@/components/donors/DonationForm';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

export default function SuperUserDonorsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const toast = useToast();

  const handleAddDonation = (donor) => {
    setSelectedDonor(donor);
    setShowDonationModal(true);
  };

  const handleDonationSuccess = () => {
    setShowDonationModal(false);
    setRefreshKey(prev => prev + 1);
    toast.success('Donation recorded!');
  };

  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Donors List</h1>

            <div className="card">
              <DonorTable 
                refreshKey={refreshKey}
                onAddDonation={handleAddDonation}
              />
            </div>

            <Modal 
              isOpen={showDonationModal} 
              onClose={() => setShowDonationModal(false)} 
              title={`Record Donation - ${selectedDonor?.first_name} ${selectedDonor?.last_name}`}
            >
              <DonationForm donorId={selectedDonor?.donor_id} onSubmit={handleDonationSuccess} />
            </Modal>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}
