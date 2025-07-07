import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit2, FiAlertTriangle, FiPackage, FiSearch } = FiIcons;

const Stock = () => {
  const { stockItems, updateStockItem, addStockItem } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    minStock: ''
  });

  const filteredItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = filteredItems.filter(item => item.quantity <= item.minStock);

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemData = {
      ...formData,
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock)
    };

    if (editingItem) {
      updateStockItem(editingItem.id, itemData);
    } else {
      addStockItem(itemData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: '',
      minStock: ''
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minStock: item.minStock.toString()
    });
    setShowModal(true);
  };

  const handleUpdateStock = (itemId, newQuantity) => {
    updateStockItem(itemId, { quantity: newQuantity });
  };

  const canEdit = user?.role === 'Admin' || user?.role === 'Barista';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manajemen Stok</h1>
        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-5 w-5" />
            <span>Tambah Stok</span>
          </button>
        )}
      </div>

      {/* Search */}
      <GlassCard className="p-6">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-3 h-5 w-5 text-white/50" />
          <input
            type="text"
            placeholder="Cari stok..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </GlassCard>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6 border-red-500/30 bg-red-500/10">
            <div className="flex items-center space-x-3 mb-4">
              <SafeIcon icon={FiAlertTriangle} className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-semibold text-red-400">
                Peringatan Stok Menipis ({lowStockItems.length} item)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <h3 className="text-white font-medium">{item.name}</h3>
                  <p className="text-red-400 text-sm">
                    Stok: {item.quantity} {item.unit} (Min: {item.minStock} {item.unit})
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Stock Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className={`p-6 hover:bg-white/15 transition-colors ${
              item.quantity <= item.minStock ? 'border-red-500/30' : ''
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    item.quantity <= item.minStock ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    <SafeIcon icon={FiPackage} className={`h-5 w-5 ${
                      item.quantity <= item.minStock ? 'text-red-400' : 'text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <p className="text-white/70 text-sm">Unit: {item.unit}</p>
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 p-2 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Stok Saat Ini:</span>
                  <span className={`text-lg font-bold ${
                    item.quantity <= item.minStock ? 'text-red-400' : 'text-white'
                  }`}>
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Stok Minimum:</span>
                  <span className="text-white">{item.minStock} {item.unit}</span>
                </div>

                {/* Stock Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.quantity <= item.minStock ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((item.quantity / (item.minStock * 2)) * 100, 100)}%`
                    }}
                  ></div>
                </div>

                {canEdit && (
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleUpdateStock(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 0}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      - 1
                    </button>
                    <button
                      onClick={() => handleUpdateStock(item.id, item.quantity + 1)}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 py-2 rounded-lg transition-colors text-sm"
                    >
                      + 1
                    </button>
                    <button
                      onClick={() => handleUpdateStock(item.id, item.quantity + 10)}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 py-2 rounded-lg transition-colors text-sm"
                    >
                      + 10
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              {editingItem ? 'Edit Stok' : 'Tambah Stok'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nama Bahan
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Jumlah
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Satuan
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="kg, liter, pcs, dll"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Stok Minimum
                </label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 py-3 rounded-lg transition-colors"
                >
                  {editingItem ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 py-3 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Stock;