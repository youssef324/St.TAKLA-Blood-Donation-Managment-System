'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { HiBell, HiUser } from 'react-icons/hi';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <motion.nav
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="bg-white shadow-sm border-b sticky top-0 z-40"
    >
      <div className="px-6 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome, {user?.username || 'User'}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiBell className="text-xl text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full cursor-pointer"
          >
            <HiUser className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {user?.username}
            </span>
            <span className={`w-2 h-2 rounded-full ${
              user?.role === 2 ? 'bg-red-500' : 
              user?.role === 1 ? 'bg-blue-500' : 
              'bg-green-500'
            }`}></span>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}