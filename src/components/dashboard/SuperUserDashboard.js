'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatsCard from '@/components/dashboard/StatsCard';
import DonorTable from '@/components/donors/DonorTable';
import DonorForm from '@/components/donors/DonorForm';
import DonationForm from '@/components/donors/DonationForm';
import ExcelExport from '@/components/shared/ExcelExport';

export default function SuperUserDashboardContent() {
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Donors" value="--" icon="👥" color="from-blue-500 to-blue-600" />
        <StatsCard title="Donations This Year" value="--" icon="🩸" color="from-red-500 to-red-600" />
        <StatsCard title="Current Session" value="--" icon="📅" color="from-green-500 to-green-600" />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setShowAddDonor(true)}>➕ Add New Donor</Button>
        <ExcelExport />
      </div>

      {/* Donors Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-bold mb-4">📋 All Donors</h3>
        <DonorTable
          refreshKey={refreshKey}
          onAddDonation={(donor) => {
            setSelectedDonor(donor);
            setShowAddDonation(true);
          }}
        />
      </motion.div>

      {/* Modals */}
      <Modal isOpen={showAddDonor} onClose={() => setShowAddDonor(false)} title="Add New Donor">
        <DonorForm onSubmit={() => { setShowAddDonor(false); refresh(); }} />
      </Modal>

      <Modal
        isOpen={showAddDonation}
        onClose={() => setShowAddDonation(false)}
        title={`Add Donation - ${selectedDonor?.first_name || ''} ${selectedDonor?.last_name || ''}`}
      >
        <DonationForm
          donor={selectedDonor}
          onSuccess={() => { setShowAddDonation(false); refresh(); }}
        />
      </Modal>
    </div>
  );
}