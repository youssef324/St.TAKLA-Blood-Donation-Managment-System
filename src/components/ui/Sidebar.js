'use client';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import { 
  HiHome, HiUserGroup, HiPlusCircle, HiCog, 
  HiUsers, HiChartBar, HiLogout 
} from 'react-icons/hi';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userLinks = [
    { href: '/dashboard/user', icon: HiHome, label: 'Dashboard' },
    { href: '/dashboard/user/search', icon: HiUserGroup, label: 'Search Donors' },
  ];

  const superUserLinks = [
    { href: '/dashboard/super-user', icon: HiHome, label: 'Dashboard' },
    { href: '/dashboard/super-user/donors', icon: HiUserGroup, label: 'Donors' },
    { href: '/dashboard/super-user/add-donor', icon: HiPlusCircle, label: 'Add Donor' },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', icon: HiHome, label: 'Dashboard' },
    { href: '/dashboard/admin/donors', icon: HiUserGroup, label: 'All Donors' },
    { href: '/dashboard/admin/users', icon: HiUsers, label: 'Users' },
    { href: '/dashboard/admin/analytics', icon: HiChartBar, label: 'Analytics' },
    { href: '/dashboard/admin/settings', icon: HiCog, label: 'Settings' },
  ];

  const links = user?.role === 2 ? adminLinks : 
                user?.role === 1 ? superUserLinks : 
                userLinks;

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed left-0 top-0 flex flex-col shadow-2xl"
    >
      <div className="p-6 border-b border-gray-700">
        <Logo size="small" />
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <motion.button
              key={link.href}
              onClick={() => router.push(link.href)}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive ? 
                  'bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/30' : 
                  'hover:bg-gray-700/50'
                }
              `}
            >
              <Icon className="text-xl" />
              <span className="font-medium">{link.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-3 px-4 py-2 bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="font-semibold">{user?.username}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            user?.role === 2 ? 'bg-red-500' : 
            user?.role === 1 ? 'bg-blue-500' : 
            'bg-green-500'
          }`}>
            {user?.role === 2 ? 'Admin' : user?.role === 1 ? 'Super User' : 'User'}
          </span>
        </div>
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/20 text-red-400 transition-all duration-300"
        >
          <HiLogout className="text-xl" />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}