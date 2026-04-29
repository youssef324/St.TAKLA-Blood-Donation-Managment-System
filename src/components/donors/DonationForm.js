'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { getCurrentYear, getCurrentSession } from '@/utils/helpers';
import { getYearsList } from '@/utils/dateUtils';
import { useToast } from '@/context/ToastContext';

export default function DonationForm({ donor, onSuccess }) {
  const [formData, setFormData] = useState({
    donor_id: donor?.donor_id || '',
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

      toast.success('Donation added successfully!');
      onSuccess && onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!donor && (
        <Input
          label="Donor ID"
          type="number"
          value={formData.donor_id}
          onChange={(e) => setFormData({ ...formData, donor_id: e.target.value })}
          required
        />
      )}

      <Select
        label="Year"
        value={formData.donation_year}
        onChange={(e) => setFormData({ ...formData, donation_year: parseInt(e.target.value) })}
        options={getYearsList().map(y => ({ value: y, label: y.toString() }))}
        required
      />

      <Select
        label="Session"
        value={formData.donation_session}
        onChange={(e) => setFormData({ ...formData, donation_session: parseInt(e.target.value) })}
        options={[
          { value: 1, label: 'First Session (January - June)' },
          { value: 2, label: 'Second Session (July - December)' },
        ]}
        required
      />

      <Input
        label="Donation Date"
        type="date"
        value={formData.donation_date}
        onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
      />

      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
        <p className="text-sm text-yellow-800">
          ⚠️ Make sure the donor hasn't already donated in this session.
        </p>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        ✅ Record Donation
      </Button>
    </form>
  );
}