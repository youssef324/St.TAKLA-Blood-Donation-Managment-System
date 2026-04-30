'use client';
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
import WhatsAppSender from '@/components/shared/WhatsAppSender';
import StatsCard from '@/components/dashboard/StatsCard';
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ 
    donors: 0, 
    donations: 0, 
    users: 0,
    bloodTypes: {} 
  });
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setStats({
        donors: data.donors,
        donations: data.donations,
        users: data.users,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Could not refresh dashboard stats');
    }
  const handleView = (donor) => {
    setSelectedDonor(donor);
    setShowProfileModal(true);
  };

  return (
    <ProtectedRoute allowedRoles={[2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Full system control panel</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowWhatsApp(true)} icon="💬">
                  Send WhatsApp
                </Button>
                <ExcelExport />
                <Button onClick={() => setShowAddModal(true)} icon="➕">
                  Add Donor
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Total Donors" value={stats.donors} icon="👥" color="from-blue-500 to-blue-600" />
              <StatsCard title="Total Donations" value={stats.donations} icon="🩸" color="from-red-500 to-red-600" />
              <StatsCard title="Active Users" value={stats.users} icon="👤" color="from-green-500 to-green-600" />
              <StatsCard title="Blood Types" value="8" icon="🅰️" color="from-purple-500 to-purple-600" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard/admin/users')}
                className="card cursor-pointer hover:shadow-xl transition-all text-center"
              >
                <div className="text-4xl mb-3">👤</div>
                <h3 className="text-lg font-semibold">Manage Users</h3>
                <p className="text-gray-500 text-sm">Add/Edit system users</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowWhatsApp(true)}
                className="card cursor-pointer hover:shadow-xl transition-all text-center"
              >
                <div className="text-4xl mb-3">💬</div>
                <h3 className="text-lg font-semibold">WhatsApp</h3>
                <p className="text-gray-500 text-sm">Send messages to donors</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card cursor-pointer hover:shadow-xl transition-all text-center"
              >
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold">Reports</h3>
                <p className="text-gray-500 text-sm">View analytics & export</p>
              </motion.button>
            </div>

            {/* Donors Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-xl font-bold mb-4">Recent Donors</h2>
              <DonorTable 
                refreshKey={refreshKey}
                isAdmin={true}
                onView={handleView}
              />
            </motion.div>

            {/* Modals */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Donor">
              <DonorForm onSubmit={() => {
                setShowAddModal(false);
                setRefreshKey(prev => prev + 1);
                toast.success('Donor added!');
              }} />
            </Modal>

            <Modal isOpen={showWhatsApp} onClose={() => setShowWhatsApp(false)} title="Send WhatsApp Message" size="large">
              <WhatsAppSender onClose={() => setShowWhatsApp(false)} />
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
}