'use client';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { BLOOD_TYPES, ALEXANDRIA_DISTRICTS } from '@/utils/constants';
import { validatePhone, validateAge } from '@/utils/validators';
import { useToast } from '@/context/ToastContext';

export default function DonorForm({ donor = null, onSubmit }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    first_name: donor?.first_name || '',
    last_name: donor?.last_name || '',
    birthdate: donor?.birthdate || '',
    phone_number: donor?.phone_number || '+20',
    blood_type: donor?.blood_type || '',
    district_id: donor?.district_id || '',
    full_address: donor?.full_address || '',
    notes: donor?.notes || '',
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('districts').select('*');
      setDistricts(data || []);
    } catch (error) {
      // Fallback to hardcoded list
      setDistricts(ALEXANDRIA_DISTRICTS.map((name, id) => ({
        district_id: id + 1,
        district_name: name
      })));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!validatePhone(formData.phone_number)) newErrors.phone_number = 'Phone must start with +20 followed by 10-11 digits';
    if (!validateAge(formData.birthdate)) newErrors.birthdate = 'Donor must be between 18 and 60 years old';
    if (!formData.blood_type) newErrors.blood_type = 'Blood type is required';
    if (!formData.district_id) newErrors.district_id = 'District is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      const url = donor ? '/api/donors' : '/api/donors';
      const method = donor ? 'PUT' : 'POST';
      const body = donor ? { donor_id: donor.donor_id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success(donor ? 'Donor updated!' : 'Donor added!');
      onSubmit();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          error={errors.first_name}
          required
        />
        <Input
          label="Last Name"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          error={errors.last_name}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Birth Date"
          type="date"
          value={formData.birthdate}
          onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
          error={errors.birthdate}
          required
        />
        <Input
          label="Phone Number"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          error={errors.phone_number}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Blood Type"
          value={formData.blood_type}
          onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
          options={BLOOD_TYPES.map(bt => ({ value: bt, label: bt }))}
          error={errors.blood_type}
          required
        />
        <Select
          label="District"
          value={formData.district_id}
          onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
          options={districts.map(d => ({ value: d.district_id, label: d.district_name }))}
          error={errors.district_id}
          required
        />
      </div>

      <Input
        label="Full Address"
        value={formData.full_address}
        onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
        placeholder="Street, building number, etc."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medical Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows="3"
          className="w-full px-4 py-2 rounded-xl ring-1 ring-gray-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
          placeholder="Any medical conditions or notes..."
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="submit" loading={loading}>
          {donor ? 'Update Donor' : 'Add Donor'}
        </Button>
      </div>
    </form>
  );
}