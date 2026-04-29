'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/ui/SearchBar';
import DonorProfile from '@/components/donors/DonorProfile';
import { useDonors } from '@/hooks/useDonors';

export default function UserDashboard() {
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [filters, setFilters] = useState({
    blood_type: '',
    year: '',
    session: '',
  });
  const { donors, loading } = useDonors(filters);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h3 className="text-lg font-bold mb-4">🔍 Search Donors</h3>
            
            <div className="space-y-3">
              <SearchBar
                onSearch={(value) => setFilters({ ...filters, query: value })}
                placeholder="Name or phone..."
              />

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-400 py-4">Loading...</p>
                ) : donors.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">No donors found</p>
                ) : (
                  donors.map((donor) => (
                    <motion.div
                      key={donor.donor_id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedDonor(donor)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedDonor?.donor_id === donor.donor_id
                          ? 'bg-red-50 border-2 border-red-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                          {donor.blood_type}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {donor.first_name} {donor.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{donor.phone_number}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card min-h-[500px]"
          >
            {selectedDonor ? (
              <DonorProfile donor={selectedDonor} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-lg">Select a donor to view profile</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}