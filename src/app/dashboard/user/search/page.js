'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DonorSearch from '@/components/donors/DonorSearch';
import DonorProfile from '@/components/donors/DonorProfile';
import { motion } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';
import DonorForm from '@/components/donors/DonorForm';
import { useToast } from '@/context/ToastContext';

export default function SearchPage() {
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const { user } = useAuth();
  const toast = useToast();

  const handleEdit = (donor) => {
    setEditingDonor(donor);
    setShowEditModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    toast.success('Donor updated successfully!');
    // If the updated donor was the one being viewed, clear it to force a refresh if needed
    // or we could refetch. For now, just close modal.
  };

  return (
    <ProtectedRoute allowedRoles={[0, 1, 2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Search Donors</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="card">
                  <DonorSearch 
                    onSelectDonor={setSelectedDonor} 
                    onEditDonor={(user?.role === 2) ? handleEdit : null}
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card"
                >
                  {selectedDonor ? (
                    <DonorProfile donorId={selectedDonor.donor_id} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center">
                      <div className="text-6xl mb-4">ðŸ”</div>
                      <p className="text-lg font-medium">Select a donor from the search results to view their profile</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            <Modal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              title={`Edit Donor - ${editingDonor?.first_name} ${editingDonor?.last_name}`}
            >
              <DonorForm donor={editingDonor} onSubmit={handleUpdateSuccess} />
            </Modal>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}
