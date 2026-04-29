'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import DonationHistory from './DonationHistory';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatPhone, calculateAge } from '@/utils/helpers';
import { HiPhone, HiLocationMarker, HiCalendar, HiClipboardList } from 'react-icons/hi';

export default function DonorProfile({ donor }) {
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);

  if (!donor) return null;

  const age = calculateAge(donor.birthdate);
  const districtName = donor.districts?.district_name || 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {donor.blood_type}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {donor.first_name} {donor.last_name}
            </h2>
            <p className="text-gray-500">Donor ID: #{donor.donor_id}</p>
          </div>
        </div>
        
        {user?.role === 2 && (
          <Button variant="secondary" size="small">
            ✏️ Edit
          </Button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
        >
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <HiPhone className="text-xl" />
            <span className="text-sm font-medium">Phone</span>
          </div>
          <p className="font-semibold">{formatPhone(donor.phone_number)}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
        >
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <HiCalendar className="text-xl" />
            <span className="text-sm font-medium">Age</span>
          </div>
          <p className="font-semibold">{age} years old</p>
          <p className="text-xs text-gray-500">Born: {formatDate(donor.birthdate)}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
        >
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <HiLocationMarker className="text-xl" />
            <span className="text-sm font-medium">Location</span>
          </div>
          <p className="font-semibold">{districtName}</p>
          {donor.full_address && (
            <p className="text-xs text-gray-500">{donor.full_address}</p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl"
        >
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <HiClipboardList className="text-xl" />
            <span className="text-sm font-medium">Donations</span>
          </div>
          <p className="font-semibold">{donor.donations?.length || 0} total</p>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-blue-600 hover:underline"
          >
            View history
          </button>
        </motion.div>
      </div>

      {/* Medical Notes */}
      {donor.notes && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 rounded-xl border border-red-200"
        >
          <p className="text-sm font-medium text-red-800 mb-1">⚠️ Medical Notes</p>
          <p className="text-sm text-red-600">{donor.notes}</p>
        </motion.div>
      )}

      {/* Donation History */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t pt-4"
        >
          <DonationHistory donations={donor.donations || []} />
        </motion.div>
      )}

      {/* WhatsApp Button for Admin */}
      {user?.role === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 pt-4 border-t"
        >
          <Button
            variant="success"
            size="small"
            onClick={() => {
              window.open(`https://wa.me/${donor.phone_number}`, '_blank');
            }}
          >
            💬 WhatsApp
          </Button>
          {/* <Button
            variant="secondary"
            size="small"
            onClick={() => {
              window.open(`tel:${donor.phone_number}`, '_self');
            }}
          >
            📞 Call
          </Button> */}
        </motion.div>
      )}
    </motion.div>
  );
}