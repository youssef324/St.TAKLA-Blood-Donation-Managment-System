'use client';

export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DonorForm from '@/components/donors/DonorForm';
import DonorTable from '@/components/donors/DonorTable';
import DonorProfile from '@/components/donors/DonorProfile';
import ExcelExport from '@/components/shared/ExcelExport';
import StatsCard from '@/components/dashboard/StatsCard';
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function SuperUserDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, thisYear: 0, thisSession: 0 });
  const toast = useToast();

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setStats({
        total: data.donors,
        thisYear: data.thisYear,
        thisSession: data.thisSession,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Could not refresh dashboard stats');
    }
  };

  const handleAddDonor = () => {
    setShowAddModal(false);
    setRefreshKey(prev => prev + 1);
    toast.success('Donor added successfully!');
  };

  const handleAddDonation = () => {
    setShowAddDonation(false);
    setRefreshKey(prev => prev + 1);
    toast.success('Donation added successfully!');
  };

  const handleView = (donor) => {
    setSelectedDonor(donor);
    setShowProfileModal(true);
  };

  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Super User Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage donors and donations</p>
              </div>
              <div className="flex gap-3">
                <ExcelExport />
                <Button onClick={() => setShowAddModal(true)} icon="âž•">
                  Add New Donor
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard 
                title="Total Donors" 
                value={stats.total} 
                icon="ðŸ‘¥"
                color="from-blue-500 to-blue-600"
              />
              <StatsCard 
                title="This Year" 
                value={stats.thisYear} 
                icon="ðŸ“…"
                color="from-green-500 to-green-600"
              />
              <StatsCard 
                title="Current Session" 
                value={stats.thisSession} 
                icon="ðŸ©¸"
                color="from-red-500 to-red-600"
              />
            </div>

            {/* Donors Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <DonorTable 
                refreshKey={refreshKey}
                onAddDonation={(donor) => {
                  setSelectedDonor(donor);
                  setShowAddDonation(true);
                }}
                onView={handleView}
              />
            </motion.div>

            {/* Add Donor Modal */}
            <Modal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              title="Add New Donor"
            >
              <DonorForm onSubmit={handleAddDonor} />
            </Modal>

            {/* Add Donation Modal */}
            <Modal
              isOpen={showAddDonation}
              onClose={() => setShowAddDonation(false)}
              title={`Add Donation - ${selectedDonor?.first_name} ${selectedDonor?.last_name}`}
            >
              <Button onClick={handleAddDonation}>Confirm Donation</Button>
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