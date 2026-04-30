'use client';
import { useState, useEffect } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Gathering insights..." />;

  const chartData = [
    { label: 'Donors', value: stats?.donors || 0, color: 'bg-blue-500' },
    { label: 'Donations', value: stats?.donations || 0, color: 'bg-red-500' },
    { label: 'This Year', value: stats?.thisYear || 0, color: 'bg-green-500' },
    { label: 'This Session', value: stats?.thisSession || 0, color: 'bg-purple-500' },
  ];

  const distributionData = stats?.bloodTypeDistribution || {};
  const bloodTypeChart = Object.entries(distributionData)
    .filter(([_, value]) => value > 0)
    .map(([label, value]) => ({ 
      label, 
      value, 
      color: label.includes('+') ? 'bg-red-500' : 'bg-blue-400' 
    }));

  const maxDist = Math.max(...bloodTypeChart.map(d => d.value), 1);
  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <ProtectedRoute allowedRoles={[2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">System Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Summary Chart */}
              <div className="card">
                <h3 className="text-lg font-bold mb-6">Growth Overview</h3>
                <div className="space-y-6">
                  {chartData.map((item, i) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / maxVal) * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blood Type Distribution */}
              <div className="card">
                <h3 className="text-lg font-bold mb-6">Blood Type Distribution</h3>
                <div className="grid grid-cols-2 gap-4">
                  {bloodTypeChart.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-bold text-gray-600">{item.label}</div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / maxDist) * 100}%` }}
                          className={`h-full ${item.color}`}
                        />
                      </div>
                      <div className="text-xs text-gray-500 w-6">{item.value}</div>
                    </div>
                  ))}
                  {bloodTypeChart.length === 0 && <p className="col-span-2 text-gray-400 italic">No data available</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <p className="text-red-100 text-sm">Donation Rate</p>
                  <p className="text-3xl font-bold mt-1">
                    {stats?.donors ? ((stats.donations / stats.donors) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-xs text-red-100 mt-2">Avg donations per donor</p>
                </div>
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <p className="text-blue-100 text-sm">System Health</p>
                  <p className="text-3xl font-bold mt-1">Excellent</p>
                  <p className="text-xs text-blue-100 mt-2">All services operational</p>
                </div>
                <div className="card lg:col-span-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">Active Admin Sessions</h4>
                    <p className="text-gray-500 text-sm">Real-time tracking enabled</p>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold">
                        A{i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}