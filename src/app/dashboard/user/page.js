'use client';
import { useState } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DonorSearch from '@/components/donors/DonorSearch';
import DonorProfile from '@/components/donors/DonorProfile';
import { motion } from 'framer-motion';

export default function UserDashboard() {
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchParams, setSearchParams] = useState({});

  return (
    <ProtectedRoute allowedRoles={[0, 1, 2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Donor Search</h1>
              <p className="text-gray-600 mt-2">Search and view donor profiles</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card"
                >
                  <DonorSearch 
                    onSelectDonor={setSelectedDonor}
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                  />
                </motion.div>
              </div>

              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card"
                >
                  {selectedDonor ? (
                    <DonorProfile donor={selectedDonor} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg">Search for a donor to view their profile</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}