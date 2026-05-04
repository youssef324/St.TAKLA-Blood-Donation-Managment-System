'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlusCircle, FaPhone, FaChurch, FaMapMarkerAlt } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import DonationHistory from './DonationHistory';
import DonationForm from './DonationForm';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatPhone, calculateAge } from '@/utils/helpers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DonorProfile({ donorId, donor: initialDonor, onClose }) {
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [donor, setDonor] = useState(initialDonor);
  const [loading, setLoading] = useState(false);

  const fetchFullDetails = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/donors/${id}`);
      const data = await res.json();
      if (res.ok) {
        setDonor(data.donor);
      }
    } catch (error) {
      console.error('Failed to fetch full donor details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (donorId) {
      fetchFullDetails(donorId);
    } else if (initialDonor?.donor_id) {
      fetchFullDetails(initialDonor.donor_id);
    }
  }, [donorId, initialDonor?.donor_id]);

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!donor) return (
    <div className="p-12 text-center text-gray-500">
      <p>Unable to load donor information.</p>
      <Button variant="ghost" onClick={onClose} className="mt-4">Close</Button>
    </div>
  );

  const age = calculateAge(donor.birthdate);
  const districtName = donor.districts?.district_name || 'Unknown';
  const lastDonation = donor.donations?.[0];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-800 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-black border-4 border-white/30 shadow-inner">
              {donor.blood_type}
            </div>
            <div>
              <h2 className="text-3xl font-black">{donor.first_name} {donor.last_name}</h2>
              <p className="text-red-100 font-medium tracking-wide">National ID: {user?.role > 0 ? donor.ssn : '••••••••••••'}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-tighter">
                  Age: {age}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-tighter">
                  District: {districtName}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            {(user?.role === 1 || user?.role === 2) && (
              <Button 
                variant="success" 
                className="shadow-lg shadow-green-900/20"
                onClick={() => setShowAddDonation(true)}
              >
                <FaPlusCircle className="inline mr-2" /> Record New Donation
              </Button>
            )}
            <div className="text-center md:text-right">
              <p className="text-xs text-red-200 uppercase font-bold tracking-widest">Last Donation</p>
              <p className="text-xl font-black">
                {lastDonation ? formatDate(lastDonation.donation_date) : 'Never'}
              </p>
            </div>
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact & Location Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card h-full">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Contact & Location</h3>
            <div className="space-y-6">
              <InfoRow icon={<FaPhone />} label="Phone Number" value={formatPhone(donor.phone_number)} link={`tel:${donor.phone_number}`} />
              <InfoRow icon={<FaChurch />} label="Church" value={donor.church || 'Not specified'} />
              <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={donor.full_address || 'Not specified'} sub={districtName} />
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="small" 
                  className="flex-1"
                  onClick={() => window.open(`https://wa.me/${donor.phone_number.replace('+', '')}`, '_blank')}
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Donation History</h3>
              <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-[10px] font-black uppercase">
                {donor.donations?.length || 0} Total
              </span>
            </div>
            
            {donor.donations?.length > 0 ? (
              <DonationHistory donations={donor.donations} />
            ) : (
              <div className="py-12 text-center text-gray-400">
                <p>No donation records found for this donor.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical Notes Footer */}
      {donor.notes && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h4 className="text-xs font-bold text-yellow-700 uppercase mb-2">Medical Warning / Notes</h4>
          <p className="text-gray-700 italic">"{donor.notes}"</p>
        </div>
      )}

      {/* Add Donation Modal */}
      <Modal
        isOpen={showAddDonation}
        onClose={() => setShowAddDonation(false)}
        title="Record New Donation"
      >
        <DonationForm 
          donorId={donor.donor_id} 
          donor={donor}
          onSuccess={() => {
            setShowAddDonation(false);
            fetchFullDetails(donor.donor_id);
          }} 
        />
      </Modal>
    </div>
  );
}

function InfoRow({ icon, label, value, sub, link }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shadow-sm border border-gray-100 text-gray-600">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        {link ? (
          <a href={link} className="font-bold text-gray-800 hover:text-red-600 transition-colors">{value}</a>
        ) : (
          <p className="font-bold text-gray-800">{value}</p>
        )}
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}