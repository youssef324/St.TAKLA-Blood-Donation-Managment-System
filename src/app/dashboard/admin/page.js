'use client';

export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { FaUsers, FaTint, FaUserCheck, FaWhatsapp, FaPlus, FaChartBar, FaUserCog, FaVial } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DonorForm from '@/components/donors/DonorForm';
import DonorTable from '@/components/donors/DonorTable';
import DonorProfile from '@/components/donors/DonorProfile';
import StatsCard from '@/components/dashboard/StatsCard';
import { motion } from 'framer-motion';
import WhatsAppSender from '@/components/shared/WhatsAppSender';
import ExcelExport from '@/components/shared/ExcelExport';

export default function AdminDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ donors: 0, donations: 0, users: 0 });
  const router = useRouter();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const [donorsRes, usersRes] = await Promise.all([
        fetch('/api/donors?limit=1'),
        fetch('/api/admin/users'),
      ]);
      
      if (donorsRes.ok) {
        const data = await donorsRes.json();
        setStats(prev => ({ ...prev, donors: data.total || 0 }));
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setStats(prev => ({ ...prev, users: data.users?.length || 0 }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

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
            {message && (
              <div className={`mb-4 p-3 rounded-xl ${
                message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Full system control panel</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowWhatsApp(true)}>
                  <FaWhatsapp className="inline mr-2" /> Send WhatsApp
                </Button>
                <ExcelExport />
                <Button onClick={() => setShowAddModal(true)}>
                  <FaPlus className="inline mr-2" /> Add Donor
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Total Donors" value={stats.donors} icon={<FaUsers />} color="from-blue-500 to-blue-600" />
              <StatsCard title="Total Donations" value={stats.donations} icon={<FaTint />} color="from-red-500 to-red-600" />
              <StatsCard title="Active Users" value={stats.users} icon={<FaUserCheck />} color="from-green-500 to-green-600" />
              <StatsCard title="Blood Types" value="8" icon={<FaVial />} color="from-purple-500 to-purple-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/dashboard/admin/users')} className="card cursor-pointer text-center p-6">
                <FaUserCog size={40} className="mx-auto mb-3 text-blue-500" />
                <h3 className="text-lg font-semibold">Manage Users</h3>
                <p className="text-gray-500 text-sm">Add/Edit system users</p>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowWhatsApp(true)} className="card cursor-pointer text-center p-6">
                <FaWhatsapp size={40} className="mx-auto mb-3 text-green-500" />
                <h3 className="text-lg font-semibold">WhatsApp</h3>
                <p className="text-gray-500 text-sm">Send messages to donors</p>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="card cursor-pointer text-center p-6">
                <FaChartBar size={40} className="mx-auto mb-3 text-purple-500" />
                <h3 className="text-lg font-semibold">Reports</h3>
                <p className="text-gray-500 text-sm">View analytics & export</p>
              </motion.button>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
              <h2 className="text-xl font-bold mb-4">Recent Donors</h2>
              <DonorTable refreshKey={refreshKey} isAdmin={true} onView={handleView} />
            </motion.div>

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Donor">
              <DonorForm onSubmit={() => {
                setShowAddModal(false);
                setRefreshKey(prev => prev + 1);
                showMessage('Donor added successfully!');
              }} />
            </Modal>

            <Modal isOpen={showWhatsApp} onClose={() => setShowWhatsApp(false)} title="Send WhatsApp Message" size="large">
              <WhatsAppSender onClose={() => setShowWhatsApp(false)} />
            </Modal>

            <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Donor Profile" size="large">
              {selectedDonor && <DonorProfile donor={selectedDonor} />}
            </Modal>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}