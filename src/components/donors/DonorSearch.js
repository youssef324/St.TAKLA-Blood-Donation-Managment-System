'use client';
import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { BLOOD_TYPES } from '@/utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { getYearsList } from '@/utils/dateUtils';

export default function DonorSearch({ onSelectDonor, onEditDonor, searchParams, setSearchParams }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    blood_type: '',
    year: '',
    session: '',
  });

  const searchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (filters.blood_type) params.append('blood_type', filters.blood_type);
      if (filters.year) params.append('year', filters.year);
      if (filters.session) params.append('session', filters.session);
      
      const res = await fetch(`/api/donors?${params.toString()}`);
      const data = await res.json();
      setResults(data.donors || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        label="Search Donors"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Name or phone number..."
        icon="🔍"
      />

      <Select
        label="Blood Type"
        value={filters.blood_type}
        onChange={(e) => setFilters({ ...filters, blood_type: e.target.value })}
        options={BLOOD_TYPES.map(bt => ({ value: bt, label: bt }))}
        placeholder="All blood types"
      />

      <Select
        label="Year"
        value={filters.year}
        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        options={getYearsList().map(y => ({ value: y, label: y.toString() }))}
        placeholder="All years"
      />

      <Select
        label="Session"
        value={filters.session}
        onChange={(e) => setFilters({ ...filters, session: e.target.value })}
        options={[
          { value: 1, label: 'First (Jun)' },
          { value: 2, label: 'Second (Dec)' },
        ]}
        placeholder="All sessions"
      />

      <Button onClick={searchDonors} loading={loading} className="w-full">
        Search
      </Button>

      <AnimatePresence>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((donor) => (
            <motion.div
              key={donor.donor_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectDonor(donor)}
              className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-red-50 hover:border-red-200 border border-transparent transition-all flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                  {donor.blood_type}
                </div>
                <div>
                  <p className="font-semibold">{donor.first_name} {donor.last_name}</p>
                  <p className="text-sm text-gray-500">
                    {donor.phone_number} • {donor.districts?.district_name || 'No District'}
                  </p>
                </div>
              </div>

              {onEditDonor && (
                <Button 
                  size="small" 
                  variant="secondary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDonor(donor);
                  }}
                >
                  ✏️
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
      
      {results.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-4">No donors found</p>
      )}
    </div>
  );
}