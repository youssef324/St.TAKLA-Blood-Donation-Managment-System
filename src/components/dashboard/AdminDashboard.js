'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatsCard from '@/components/dashboard/StatsCard';
import DonorTable from '@/components/donors/DonorTable';
import DonorForm from '@/components/donors/DonorForm';
import WhatsAppSender from '@/components/shared/WhatsAppSender';
import ExcelExport from '@/components/shared/ExcelExport';

export default function AdminDashboardContent() {
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const refresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Donors" value="--" icon="👥" color="from-blue-500 to-blue-600" />
        <StatsCard title="Donations" value="--" icon="🩸" color="from-red-500 to-red-600" />
        <StatsCard title="Users" value="--" icon="👤" color="from-green-500 to-green-600" />
        <StatsCard title="Blood Types" value="8" icon="🅰️" color="from-purple-500 to-purple-600" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={() => router.push('/dashboard/admin/users')}
          className="card text-center cursor-pointer"
        >
          <div className="text-4xl mb-3">👤</div>
          <h3 className="text-lg font-semibold">Manage Users</h3>
          <p className="text-gray-500 text-sm mt-2">Add, edit, activate/deactivate</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={() => setShowWhatsApp(true)}
          className="card text-center cursor-pointer"
        >
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-lg font-semibold">WhatsApp</h3>
          <p className="text-gray-500 text-sm mt-2">Send bulk messages</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          className="card text-center cursor-pointer"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold">Reports</h3>
          <p className="text-gray-500 text-sm mt-2">Analytics & exports</p>
        </motion.button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setShowAddDonor(true)}>➕ Add Donor</Button>
        <Button variant="secondary" onClick={() => setShowWhatsApp(true)}>💬 Send WhatsApp</Button>
        <ExcelExport />
      </div>

      {/* Donors Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h3 className="text-lg font-bold mb-4">📋 All Donors</h3>
        <DonorTable refreshKey={refreshKey} isAdmin={true} />
      </motion.div>

      {/* Modals */}
      <Modal isOpen={showAddDonor} onClose={() => setShowAddDonor(false)} title="Add New Donor">
        <DonorForm onSubmit={() => { setShowAddDonor(false); refresh(); }} />
      </Modal>

      <Modal isOpen={showWhatsApp} onClose={() => setShowWhatsApp(false)} title="Send WhatsApp Message" size="large">
        <WhatsAppSender onClose={() => setShowWhatsApp(false)} />
      </Modal>
    </div>
  );
}