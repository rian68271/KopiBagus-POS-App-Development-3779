import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import GlassCard from '../components/GlassCard';
import ExportModal from '../components/ExportModal';
import ReactECharts from 'echarts-for-react';
import { format, startOfDay, endOfDay, subDays, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDownload } = FiIcons;

const Reports = () => {
  const { transactions } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showExportModal, setShowExportModal] = useState(false);

  const getDateRange = () => {
    const today = new Date();
    switch (selectedPeriod) {
      case 'today':
        return {
          start: startOfDay(today),
          end: endOfDay(today)
        };
      case 'week':
        return {
          start: startOfDay(subDays(today, 7)),
          end: endOfDay(today)
        };
      case 'month':
        return {
          start: startOfDay(subDays(today, 30)),
          end: endOfDay(today)
        };
      default:
        return {
          start: startOfDay(today),
          end: endOfDay(today)
        };
    }
  };

  const { start, end } = getDateRange();
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    return isWithinInterval(transactionDate, { start, end });
  });

  // Calculate statistics
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalSubtotal = filteredTransactions.reduce((sum, t) => sum + (t.subtotal || t.total), 0);
  const totalTax = filteredTransactions.reduce((sum, t) => sum + (t.tax || 0), 0);
  const totalOrders = filteredTransactions.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Payment method distribution
  const paymentMethods = filteredTransactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
    return acc;
  }, {});

  // Daily sales chart data
  const dailySales = {};
  filteredTransactions.forEach(transaction => {
    const date = format(new Date(transaction.timestamp), 'yyyy-MM-dd');
    dailySales[date] = (dailySales[date] || 0) + transaction.total;
  });

  const chartData = Object.entries(dailySales).map(([date, total]) => ({
    date: format(new Date(date), 'dd/MM', { locale: id }),
    total
  }));

  // Top selling items
  const itemSales = {};
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const key = item.name;
      itemSales[key] = (itemSales[key] || 0) + item.quantity;
    });
  });

  const topItems = Object.entries(itemSales)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  // Charts options
  const salesChartOption = {
    title: {
      text: 'Penjualan Harian',
      textStyle: { color: '#fff' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>Penjualan: Rp ${params[0].value.toLocaleString('id-ID')}`;
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.date),
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        color: '#fff',
        formatter: function(value) {
          return 'Rp ' + (value / 1000) + 'K';
        }
      }
    },
    series: [{
      data: chartData.map(d => d.total),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#3b82f6' },
      itemStyle: { color: '#3b82f6' },
      areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }
    }],
    backgroundColor: 'transparent'
  };

  const paymentChartOption = {
    title: {
      text: 'Metode Pembayaran',
      textStyle: { color: '#fff' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [{
      name: 'Pembayaran',
      type: 'pie',
      radius: '50%',
      data: Object.entries(paymentMethods).map(([method, count]) => ({
        value: count,
        name: method.charAt(0).toUpperCase() + method.slice(1)
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }],
    backgroundColor: 'transparent'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Laporan Penjualan</h1>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="today" className="bg-gray-800">Hari Ini</option>
            <option value="week" className="bg-gray-800">7 Hari Terakhir</option>
            <option value="month" className="bg-gray-800">30 Hari Terakhir</option>
          </select>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 px-4 py-2 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiDownload} className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="text-center">
              <p className="text-white/70 text-sm">Total Pendapatan</p>
              <p className="text-2xl font-bold text-white mt-1">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="text-center">
              <p className="text-white/70 text-sm">Total Pesanan</p>
              <p className="text-2xl font-bold text-white mt-1">{totalOrders}</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="text-center">
              <p className="text-white/70 text-sm">Rata-rata Pesanan</p>
              <p className="text-2xl font-bold text-white mt-1">
                Rp {Math.round(averageOrderValue).toLocaleString('id-ID')}
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="text-center">
              <p className="text-white/70 text-sm">Total Pajak</p>
              <p className="text-2xl font-bold text-white mt-1">
                Rp {totalTax.toLocaleString('id-ID')}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <ReactECharts option={salesChartOption} style={{ height: '300px' }} />
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <ReactECharts option={paymentChartOption} style={{ height: '300px' }} />
          </GlassCard>
        </motion.div>
      </div>

      {/* Top Selling Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Produk Terlaris</h2>
          <div className="space-y-3">
            {topItems.length === 0 ? (
              <p className="text-white/70">Belum ada data penjualan</p>
            ) : (
              topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-200 font-bold">{index + 1}</span>
                    </div>
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                  <span className="text-white/70">{item.quantity} terjual</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Transaksi Terbaru</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <p className="text-white/70">Belum ada transaksi</p>
            ) : (
              filteredTransactions.slice(-10).reverse().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">#{transaction.id}</p>
                    <p className="text-white/70 text-sm">
                      {format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm', { locale: id })}
                    </p>
                    {transaction.customerName && transaction.customerName !== 'Guest' && (
                      <p className="text-white/60 text-xs">{transaction.customerName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      Rp {transaction.total.toLocaleString('id-ID')}
                    </p>
                    <p className="text-white/70 text-sm capitalize">
                      {transaction.paymentMethod}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          data={filteredTransactions}
          onClose={() => setShowExportModal(false)}
          title="Export Laporan Penjualan"
        />
      )}
    </div>
  );
};

export default Reports;