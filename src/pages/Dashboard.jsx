import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import GlassCard from '../components/GlassCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const { FiDollarSign, FiShoppingBag, FiTrendingUp, FiAlertTriangle } = FiIcons;

const Dashboard = () => {
  const { transactions, stockItems, menuItems } = useData();

  // Calculate today's stats
  const today = new Date();
  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.timestamp);
    return transactionDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const todayOrders = todayTransactions.length;

  // Low stock items
  const lowStockItems = stockItems.filter(item => item.quantity <= item.minStock);

  // Recent transactions
  const recentTransactions = transactions.slice(-5).reverse();

  const stats = [
    {
      title: 'Pendapatan Hari Ini',
      value: `Rp ${todayRevenue.toLocaleString('id-ID')}`,
      icon: FiDollarSign,
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Pesanan Hari Ini',
      value: todayOrders.toString(),
      icon: FiShoppingBag,
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Total Menu',
      value: menuItems.length.toString(),
      icon: FiTrendingUp,
      color: 'from-purple-400 to-purple-600'
    },
    {
      title: 'Stok Menipis',
      value: lowStockItems.length.toString(),
      icon: FiAlertTriangle,
      color: 'from-red-400 to-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="text-white/70">
          {format(today, 'EEEE, dd MMMM yyyy', { locale: id })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <SafeIcon icon={stat.icon} className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Transaksi Terbaru</h2>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-white/70">Belum ada transaksi hari ini</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">#{transaction.id}</p>
                    <p className="text-white/70 text-sm">
                      {format(new Date(transaction.timestamp), 'HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      Rp {transaction.total.toLocaleString('id-ID')}
                    </p>
                    <p className="text-white/70 text-sm">
                      {transaction.items.reduce((sum, item) => sum + item.quantity, 0)} item
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Low Stock Alert */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Peringatan Stok</h2>
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-white/70">Semua stok dalam kondisi baik</p>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-white/70 text-sm">
                      Min: {item.minStock} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-medium">
                      {item.quantity} {item.unit}
                    </p>
                    <p className="text-red-400/70 text-sm">Stok menipis</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;