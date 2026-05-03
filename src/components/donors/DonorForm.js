'use client';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { BLOOD_TYPES } from '@/utils/constants';
import { validatePhone, validateAge } from '@/utils/validators';
import { saveDonorOffline } from '@/lib/offlineSync';

export default function DonorForm({ donor = null, onSubmit }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: donor?.first_name || '',
    last_name: donor?.last_name || '',
    birthdate: donor?.birthdate || '',
    ssn: donor?.ssn || '',
    phone_number: donor?.phone_number || '+20',
    blood_type: donor?.blood_type || '',
    district_id: donor?.district_id || '',
    church: donor?.church || '',
    full_address: donor?.full_address || '',
    notes: donor?.notes || '',
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await fetch('/api/districts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDistricts(data.districts || []);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      // Fallback districts if API is unreachable
      setDistricts([
        { district_id: 1, district_name: 'Al-Montazah' },
        { district_id: 2, district_name: 'Sidi Gaber' },
        { district_id: 3, district_name: 'Smouha' }
      ]);
    }
  };

  const validateSSN = (ssn) => {
    if (!ssn) return true; // Optional
    return /^\d{14}$/.test(ssn);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'Required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Required';
    if (!formData.ssn.trim()) {
      newErrors.ssn = 'National ID is required';
    } else if (!validateSSN(formData.ssn)) {
      newErrors.ssn = 'Must be 14 digits';
    }
    if (!validatePhone(formData.phone_number)) newErrors.phone_number = 'Must start with +20';
    if (!validateAge(formData.birthdate)) newErrors.birthdate = 'Age must be 18-60';
    if (!formData.blood_type) newErrors.blood_type = 'Required';
    if (!formData.district_id) newErrors.district_id = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage(null);

    try {
      const url = '/api/donors';
      const method = donor ? 'PUT' : 'POST';
      const body = donor ? { donor_id: donor.donor_id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save donor');
      }

      setMessage({ type: 'success', text: donor ? 'Donor updated!' : 'Donor added!' });
      
      if (onSubmit) {
        setTimeout(() => onSubmit(), 500);
      }
    } catch (error) {
      console.error('Save error:', error);
      
      // Fallback to offline storage if it's a new donor and network fails
      if (!donor && (error.message.includes('fetch') || !navigator.onLine)) {
        const saved = await saveDonorOffline(formData);
        if (saved) {
          setMessage({ 
            type: 'success', 
            text: '💾 Saved offline! Will sync when connection returns.' 
          });
          setIsOffline(true);
          if (onSubmit) setTimeout(() => onSubmit(), 1500);
          return;
        }
      }
      
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {message && (
        <div className={`p-3 rounded-xl text-sm ${
          message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Personal Info Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} error={errors.first_name} required />
          <Input label="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} error={errors.last_name} required />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label="Birth Date" type="date" value={formData.birthdate} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} error={errors.birthdate} required />
          <Input label="National ID (SSN)" value={formData.ssn} onChange={(e) => setFormData({ ...formData, ssn: e.target.value })} error={errors.ssn} placeholder="14 digits" required />
        </div>
      </div>

      {/* Contact & Medical Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Contact & Medical</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone Number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} error={errors.phone_number} required />
          <Select label="Blood Type" value={formData.blood_type} onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })} options={BLOOD_TYPES.map(bt => ({ value: bt, label: bt }))} error={errors.blood_type} required />
        </div>
      </div>

      {/* Location Section */}
      <div className="border-b pb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Location & Church</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select label="District" value={formData.district_id} onChange={(e) => setFormData({ ...formData, district_id: e.target.value })} options={districts.map(d => ({ value: d.district_id, label: d.district_name }))} error={errors.district_id} required />
          <Input label="Church" value={formData.church} onChange={(e) => setFormData({ ...formData, church: e.target.value })} placeholder="Church name" />
        </div>
        <div className="mt-4">
          <Input label="Full Address" value={formData.full_address} onChange={(e) => setFormData({ ...formData, full_address: e.target.value })} placeholder="Street, building number..." />
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Medical Notes</h3>
        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" className="w-full px-4 py-2 rounded-xl ring-1 ring-gray-300 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Any medical conditions or notes..." />
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t">
        <Button type="submit" loading={loading} size="large">
          {donor ? '💾 Update Donor' : '➕ Add Donor'}
        </Button>
      </div>
    </form>
  );
}