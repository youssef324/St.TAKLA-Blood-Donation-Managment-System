'use client';

export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import StatsCard from '@/components/dashboard/StatsCard';
import { BLOOD_TYPES } from '@/utils/constants';
  import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: 0,
    thisYear: 0,
    bloodTypeCounts: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/donors?limit=1000');
      const data = await res.json();
      
      if (res.ok && data.donors) {
        const donors = data.donors;
        const bloodTypeCounts = {};
        let totalDonations = 0;
        let thisYear = 0;
        const currentYear = new Date().getFullYear();

        donors.forEach(donor => {
          // Count blood types
          const bt = donor.blood_type;
          bloodTypeCounts[bt] = (bloodTypeCounts[bt] || 0) + 1;

          // Count donations
          if (donor.donations) {
            totalDonations += donor.donations.length;
            donor.donations.forEach(d => {
              if (d.donation_year === currentYear) thisYear++;
            });
          }
        });

        setStats({
          totalDonors: donors.length,
          totalDonations,
          thisYear,
          bloodTypeCounts,
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={[2]}>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 ml-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">System statistics and insights</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Total Donors" value={stats.totalDonors} icon="ðŸ‘¥" color="from-blue-500 to-blue-600" />
              <StatsCard title="Total Donations" value={stats.totalDonations} icon="ðŸ©¸" color="from-red-500 to-red-600" />
              <StatsCard title="This Year" value={stats.thisYear} icon="ðŸ“…" color="from-green-500 to-green-600" />
              <StatsCard title="Blood Types" value={Object.keys(stats.bloodTypeCounts).length} icon="ðŸ…°ï¸" color="from-purple-500 to-purple-600" />
            </div>

            {/* Blood Type Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-8">
              <h2 className="text-xl font-bold mb-6">Blood Type Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BLOOD_TYPES.map((type) => {
                  const count = stats.bloodTypeCounts[type] || 0;
                  const percentage = stats.totalDonors > 0 ? ((count / stats.totalDonors) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={type} className="p-4 bg-gray-50 rounded-xl text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">{type}</div>
                      <div className="text-2xl font-bold text-gray-800">{count}</div>
                      <div className="text-sm text-gray-500">donors ({percentage}%)</div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
                <h3 className="text-lg font-bold mb-4">ðŸ“Š Most Common Blood Types</h3>
                {Object.entries(stats.bloodTypeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="font-semibold text-red-600">{type}</span>
                      <span className="text-gray-600">{count} donors</span>
                    </div>
                  ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
                <h3 className="text-lg font-bold mb-4">ðŸŽ¯ System Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">App Name</span>
                    <span className="font-semibold">Blood Donations</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Database</span>
                    <span className="font-semibold text-green-600">Connected âœ…</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Session Timeout</span>
                    <span className="font-semibold">4 hours</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Total Records</span>
                    <span className="font-semibold">{stats.totalDonors} donors</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}