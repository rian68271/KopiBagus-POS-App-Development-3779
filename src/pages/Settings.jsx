import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { showNotification } from '../components/NotificationSystem';

const { FiSettings, FiUser, FiLock, FiSave, FiDatabase, FiDownload, FiTrash2 } = FiIcons;

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    companyName: 'KopiBagus',
    address: 'Jl. Kopi Bagus No. 123, Jakarta',
    phone: '(021) 123-4567',
    email: 'info@kopibagus.com',
    taxRate: 0,
    currency: 'IDR',
    language: 'id',
    theme: 'dark',
    receiptFooter: 'Terima kasih atas kunjungan Anda!',
    autoBackup: true,
    lowStockAlert: true,
    printReceipt: true
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: FiUser },
    { id: 'company', label: 'Perusahaan', icon: FiSettings },
    { id: 'system', label: 'Sistem', icon: FiDatabase }
  ];

  const handleSave = () => {
    localStorage.setItem('kopibagus_settings', JSON.stringify(settings));
    showNotification({
      type: 'success',
      title: 'Pengaturan Disimpan',
      message: 'Semua pengaturan telah disimpan successfully'
    });
  };

  const handleExportData = () => {
    const data = {
      menu: JSON.parse(localStorage.getItem('kopibagus_menu') || '[]'),
      stock: JSON.parse(localStorage.getItem('kopibagus_stock') || '[]'),
      transactions: JSON.parse(localStorage.getItem('kopibagus_transactions') || '[]'),
      settings: settings
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kopibagus-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification({
      type: 'success',
      title: 'Data Exported',
      message: 'Data berhasil diekspor ke file JSON'
    });
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.menu) localStorage.setItem('kopibagus_menu', JSON.stringify(data.menu));
        if (data.stock) localStorage.setItem('kopibagus_stock', JSON.stringify(data.stock));
        if (data.transactions) localStorage.setItem('kopibagus_transactions', JSON.stringify(data.transactions));
        if (data.settings) setSettings(data.settings);

        showNotification({
          type: 'success',
          title: 'Data Imported',
          message: 'Data berhasil diimpor. Refresh halaman untuk melihat perubahan.'
        });
      } catch (error) {
        showNotification({
          type: 'error',
          title: 'Import Failed',
          message: 'File tidak valid atau rusak'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      localStorage.removeItem('kopibagus_menu');
      localStorage.removeItem('kopibagus_stock');
      localStorage.removeItem('kopibagus_transactions');
      localStorage.removeItem('kopibagus_settings');
      
      showNotification({
        type: 'success',
        title: 'Data Reset',
        message: 'Semua data telah dihapus. Refresh halaman untuk melihat perubahan.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <GlassCard className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <SafeIcon icon={tab.icon} className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </GlassCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Profil Pengguna</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Nama
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiLock} className="h-5 w-5 text-blue-400" />
                    <span className="text-blue-200 font-medium">Informasi Keamanan</span>
                  </div>
                  <p className="text-blue-200/80 text-sm mt-2">
                    Untuk mengubah password atau informasi akun lainnya, silakan hubungi administrator sistem.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Informasi Perusahaan</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Nama Perusahaan
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Telepon
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Alamat
                  </label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Footer Struk
                  </label>
                  <textarea
                    value={settings.receiptFooter}
                    onChange={(e) => setSettings({...settings, receiptFooter: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Pajak (%)
                    </label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Mata Uang
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                      <option value="IDR" className="bg-gray-800">IDR - Indonesian Rupiah</option>
                      <option value="USD" className="bg-gray-800">USD - US Dollar</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Pengaturan Sistem</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Auto Backup</h3>
                      <p className="text-white/70 text-sm">Otomatis backup data setiap hari</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Peringatan Stok Rendah</h3>
                      <p className="text-white/70 text-sm">Tampilkan notifikasi saat stok menipis</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.lowStockAlert}
                        onChange={(e) => setSettings({...settings, lowStockAlert: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Auto Print Receipt</h3>
                      <p className="text-white/70 text-sm">Otomatis cetak struk setelah transaksi</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.printReceipt}
                        onChange={(e) => setSettings({...settings, printReceipt: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-6">
                  <h3 className="text-white font-medium mb-4">Manajemen Data</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Export Data</span>
                      <button
                        onClick={handleExportData}
                        className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 px-4 py-2 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiDownload} className="h-4 w-4" />
                        <span>Export</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Import Data</span>
                      <label className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg transition-colors cursor-pointer">
                        <SafeIcon icon={FiDatabase} className="h-4 w-4" />
                        <span>Import</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Reset All Data</span>
                      <button
                        onClick={handleResetData}
                        className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-white/20">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 px-6 py-3 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiSave} className="h-5 w-5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;