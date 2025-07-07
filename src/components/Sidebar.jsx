import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiMenu, FiShoppingCart, FiBarChart3, FiPackage, FiCoffee, FiSettings, FiTrendingUp } = FiIcons;

const Sidebar = () => {
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      icon: FiHome,
      label: 'Dashboard',
      permission: null // Accessible to all logged-in users
    },
    {
      path: '/menu',
      icon: FiMenu,
      label: 'Menu',
      permission: 'manage_menu'
    },
    {
      path: '/cashier',
      icon: FiShoppingCart,
      label: 'Kasir',
      permission: 'process_sales'
    },
    {
      path: '/reports',
      icon: FiBarChart3,
      label: 'Laporan',
      permission: 'view_reports'
    },
    {
      path: '/analytics',
      icon: FiTrendingUp,
      label: 'Analytics',
      permission: 'view_reports'
    },
    {
      path: '/stock',
      icon: FiPackage,
      label: 'Stok',
      permission: 'manage_stock'
    },
    {
      path: '/settings',
      icon: FiSettings,
      label: 'Pengaturan',
      permission: 'manage_settings'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-white/10 backdrop-blur-md border-r border-white/20 shadow-lg"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <SafeIcon icon={FiCoffee} className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold text-white">KopiBagus</h1>
        </div>
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <SafeIcon icon={item.icon} className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;