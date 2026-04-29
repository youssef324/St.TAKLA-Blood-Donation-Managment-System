'use client';
import { motion } from 'framer-motion';
import { getSessionMonths } from '@/utils/helpers';

export default function DonationHistory({ donations }) {
  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">No donation history</p>
      </div>
    );
  }

  // Group donations by year
  const groupedByYear = donations.reduce((acc, donation) => {
    if (!acc[donation.donation_year]) {
      acc[donation.donation_year] = [];
    }
    acc[donation.donation_year].push(donation);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear).sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Donation History</h3>
      
      {years.map((year, yearIndex) => (
        <motion.div
          key={year}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: yearIndex * 0.1 }}
          className="border-l-4 border-red-500 pl-4"
        >
          <h4 className="font-semibold text-red-600 mb-2">{year}</h4>
          <div className="space-y-2">
            {groupedByYear[year]
              .sort((a, b) => a.donation_session - b.donation_session)
              .map((donation) => (
                <div
                  key={donation.donation_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Session {donation.donation_session}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({getSessionMonths(donation.donation_session)})
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {donation.donation_date ? new Date(donation.donation_date).toLocaleDateString() : 'Date not recorded'}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}