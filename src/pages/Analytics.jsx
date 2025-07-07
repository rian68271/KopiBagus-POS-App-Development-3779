import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import GlassCard from '../components/GlassCard';
import ReactECharts from 'echarts-for-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

const Analytics = () => {
  const { transactions, menuItems, stockItems } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const analytics = useMemo(() => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'quarter':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfMonth(subMonths(now, 11));
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Revenue analytics
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const avgOrderValue = filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0;
    const totalOrders = filteredTransactions.length;

    // Daily revenue
    const dailyRevenue = {};
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    days.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      dailyRevenue[dateKey] = 0;
    });

    filteredTransactions.forEach(t => {
      const dateKey = format(new Date(t.timestamp), 'yyyy-MM-dd');
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + t.total;
    });

    // Product performance
    const productSales = {};
    const productRevenue = {};
    
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        productRevenue[item.name] = (productRevenue[item.name] || 0) + (item.price * item.quantity);
      });
    });

    // Payment methods
    const paymentMethods = {};
    filteredTransactions.forEach(t => {
      paymentMethods[t.paymentMethod] = (paymentMethods[t.paymentMethod] || 0) + 1;
    });

    // Hourly sales pattern
    const hourlySales = {};
    for (let i = 0; i < 24; i++) {
      hourlySales[i] = 0;
    }
    
    filteredTransactions.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      hourlySales[hour] += t.total;
    });

    return {
      totalRevenue,
      avgOrderValue,
      totalOrders,
      dailyRevenue,
      productSales,
      productRevenue,
      paymentMethods,
      hourlySales
    };
  }, [transactions, selectedPeriod]);

  // Chart options
  const revenueChartOption = {
    title: {
      text: 'Pendapatan Harian',
      textStyle: { color: '#fff' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const date = format(new Date(params[0].name), 'dd MMM yyyy', { locale: id });
        return `${date}<br/>Pendapatan: Rp ${params[0].value.toLocaleString('id-ID')}`;
      }
    },
    xAxis: {
      type: 'category',
      data: Object.keys(analytics.dailyRevenue).map(date => 
        format(new Date(date), 'dd/MM', { locale: id })
      ),
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        color: '#fff',
        formatter: (value) => `Rp ${(value / 1000)}K`
      }
    },
    series: [{
      data: Object.values(analytics.dailyRevenue),
      type: 'bar',
      itemStyle: { color: '#3b82f6' }
    }],
    backgroundColor: 'transparent'
  };

  const hourlyChartOption = {
    title: {
      text: 'Pola Penjualan per Jam',
      textStyle: { color: '#fff' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `${params[0].name}:00<br/>Penjualan: Rp ${params[0].value.toLocaleString('id-ID')}`;
      }
    },
    xAxis: {
      type: 'category',
      data: Object.keys(analytics.hourlySales).map(hour => `${hour}:00`),
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        color: '#fff',
        formatter: (value) => `Rp ${(value / 1000)}K`
      }
    },
    series: [{
      data: Object.values(analytics.hourlySales),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#10b981' },
      itemStyle: { color: '#10b981' },
      areaStyle: { color: 'rgba(16, 185, 129, 0.1)' }
    }],
    backgroundColor: 'transparent'
  };

  const productChartOption = {
    title: {
      text: 'Top 5 Produk Terlaris',
      textStyle: { color: '#fff' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `${params[0].name}<br/>Terjual: ${params[0].value} unit<br/>Pendapatan: Rp ${analytics.productRevenue[params[0].name]?.toLocaleString('id-ID') || 0}`;
      }
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'category',
      data: Object.entries(analytics.productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name),
      axisLabel: { color: '#fff' }
    },
    series: [{
      data: Object.entries(analytics.productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([,quantity]) => quantity),
      type: 'bar',
      itemStyle: { color: '#f59e0b' }
    }],
    backgroundColor: 'transparent'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <option value="month" className="bg-gray-800">Bulan Ini</option>
          <option value="quarter" className="bg-gray-800">3 Bulan Terakhir</option>
          <option value="year" className="bg-gray-800">12 Bulan Terakhir</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="text-center">
              <p className="text-white/70 text-sm">Total Pendapatan</p>
              <p className="text-2xl font-bold text-white mt-1">
                Rp {analytics.totalRevenue.toLocaleString('id-ID')}
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
              <p className="text-2xl font-bold text-white mt-1">
                {analytics.totalOrders}
              </p>
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
                Rp {Math.round(analytics.avgOrderValue).toLocaleString('id-ID')}
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
              <p className="text-white/70 text-sm">Produk Aktif</p>
              <p className="text-2xl font-bold text-white mt-1">
                {menuItems.length}
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
            <ReactECharts option={revenueChartOption} style={{ height: '300px' }} />
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <ReactECharts option={hourlyChartOption} style={{ height: '300px' }} />
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <ReactECharts option={productChartOption} style={{ height: '300px' }} />
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Metode Pembayaran</h3>
            <div className="space-y-3">
              {Object.entries(analytics.paymentMethods).map(([method, count]) => {
                const percentage = (count / analytics.totalOrders) * 100;
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white capitalize">{method}</span>
                      <span className="text-white/70">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;