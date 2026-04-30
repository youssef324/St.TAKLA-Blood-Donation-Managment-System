'use client';
import { motion } from 'framer-motion';
import { getSessionMonths } from '@/utils/helpers';

export default function DonationHistory({ donations }) {
  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-gray-500 font-medium">No donation history yet.</p>
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
    <div className="space-y-8">
      {years.map((year, yearIndex) => (
        <motion.div
          key={year}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: yearIndex * 0.1 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <h4 className="text-xl font-black text-gray-800">{year}</h4>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedByYear[year]
              .sort((a, b) => b.donation_session - a.donation_session)
              .map((donation) => (
                <div
                  key={donation.donation_id}
                  className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 text-xs font-black group-hover:bg-red-600 group-hover:text-white transition-colors">
                        S{donation.donation_session}
                      </div>
                      <div>
                        <span className="text-sm font-bold block text-gray-800">
                          Session {donation.donation_session}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                          {getSessionMonths(donation.donation_session)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-gray-400 uppercase block mb-0.5">Date</span>
                      <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                        {donation.donation_date ? new Date(donation.donation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}