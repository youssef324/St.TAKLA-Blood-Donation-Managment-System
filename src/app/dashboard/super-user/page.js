'use client';
import { useState, useEffect } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DonorForm from '@/components/donors/DonorForm';
import DonorTable from '@/components/donors/DonorTable';
import ExcelExport from '@/components/shared/ExcelExport';
import StatsCard from '@/components/dashboard/StatsCard';
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function SuperUserDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, thisYear: 0, thisSession: 0 });
  const toast = useToast();

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/donors?limit=1');
      const data = await res.json();
      setStats({
        total: data.total || 0,
        thisYear: data.total || 0, // Simplified - you can add more specific counts
        thisSession: data.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  return (
    <ProtectedRoute allowedRoles={[1]}>
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
                <Button onClick={() => setShowAddModal(true)} icon="➕">
                  Add New Donor
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard 
                title="Total Donors" 
                value={stats.total} 
                icon="👥"
                color="from-blue-500 to-blue-600"
              />
              <StatsCard 
                title="This Year" 
                value={stats.thisYear} 
                icon="📅"
                color="from-green-500 to-green-600"
              />
              <StatsCard 
                title="Current Session" 
                value={stats.thisSession} 
                icon="🩸"
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
              {/* You'll need to create DonationForm component */}
              <Button onClick={handleAddDonation}>Add Donation</Button>
            </Modal>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}