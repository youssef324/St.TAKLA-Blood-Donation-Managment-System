'use client';
import { useState } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DonorTable from '@/components/donors/DonorTable';
import DonorForm from '@/components/donors/DonorForm';
import DonorProfile from '@/components/donors/DonorProfile';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

export default function AdminDonorsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const toast = useToast();

  const handleEdit = (donor) => {
    setSelectedDonor(donor);
    setShowEditModal(true);
  };

  const handleView = (donor) => {
    setSelectedDonor(donor);
    setShowProfileModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    setRefreshKey(prev => prev + 1);
    toast.success('Donor updated successfully!');
  };

  return (
    <ProtectedRoute allowedRoles={[2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Donor Management</h1>
                <p className="text-gray-600 mt-2">View and manage all registered donors</p>
              </div>
            </div>

            <div className="card">
              <DonorTable 
                refreshKey={refreshKey}
                isAdmin={true}
                onEdit={handleEdit}
                onView={handleView}
              />
            </div>

            {/* Edit Modal */}
            <Modal 
              isOpen={showEditModal} 
              onClose={() => setShowEditModal(false)} 
              title={`Edit Donor - ${selectedDonor?.first_name} ${selectedDonor?.last_name}`}
            >
              <DonorForm donor={selectedDonor} onSubmit={handleUpdateSuccess} />
            </Modal>

            {/* Profile View Modal */}
            <Modal
              isOpen={showProfileModal}
              onClose={() => setShowProfileModal(false)}
              title="Donor Profile"
              size="large"
            >
              {selectedDonor && (
                <DonorProfile 
                  donorId={selectedDonor.donor_id} 
                  onClose={() => setShowProfileModal(false)} 
                />
              )}
            </Modal>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}