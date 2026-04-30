'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { getCurrentYear, getCurrentSession } from '@/utils/helpers';
import { useToast } from '@/context/ToastContext';

export default function DonationForm({ donor, donorId, onSuccess }) {
  const [formData, setFormData] = useState({
    donor_id: donor?.donor_id || donorId || '',
    donation_year: getCurrentYear(),
    donation_session: getCurrentSession(),
    donation_date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.donor_id) {
      toast.error('Donor ID is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success('Donation recorded successfully!');
      onSuccess && onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🩸
        </div>
        <h3 className="text-xl font-black text-red-900 mb-2">Record Donation</h3>
        <p className="text-sm text-red-700 leading-relaxed">
          You are about to record a donation for <b>{donor?.first_name || 'this donor'}</b>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Year</p>
          <p className="font-black text-gray-800 text-lg">{formData.donation_year}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Session</p>
          <p className="font-black text-gray-800 text-lg">
            {formData.donation_session === 1 ? '1st (Jan-Jun)' : '2nd (Jul-Dec)'}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">ℹ️</div>
        <p className="text-xs text-blue-700 font-medium">
          The donation date will be recorded as <b>{new Date(formData.donation_date).toLocaleDateString()}</b>.
        </p>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading} className="w-full py-4 shadow-lg shadow-red-600/20" size="large">
          ✅ Confirm & Record Donation
        </Button>
        <p className="text-[10px] text-gray-400 text-center mt-4 uppercase font-bold tracking-tighter">
          This will update the donor's history and dashboard stats
        </p>
      </div>
    </form>
  );
}