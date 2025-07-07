import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import GlassCard from '../components/GlassCard';
import SafeIcon from '../common/SafeIcon';
import PrintableReceipt from '../components/PrintableReceipt';
import { showNotification } from '../components/NotificationSystem';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiMinus, FiShoppingCart, FiTrash2, FiPrinter, FiCreditCard } = FiIcons;

const Cashier = () => {
  const { menuItems, cart, addToCart, updateCartQuantity, removeFromCart, clearCart, processTransaction } = useData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const categories = ['All', 'Coffee', 'Food', 'Beverage'];

  const filteredItems = menuItems.filter(item => {
    return selectedCategory === 'All' || item.category === selectedCategory;
  });

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const tax = totalAmount * 0.1; // 10% tax
  const finalTotal = totalAmount + tax;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'F1', action: () => setSelectedCategory('All') },
    { key: 'F2', action: () => setSelectedCategory('Coffee') },
    { key: 'F3', action: () => setSelectedCategory('Food') },
    { key: 'F4', action: () => setSelectedCategory('Beverage') },
    { key: 'F9', action: () => clearCart() },
    { key: 'F10', action: handleCheckout },
    { key: 'Escape', action: () => setShowReceipt(false) }
  ]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotification({
        type: 'error',
        title: 'Keranjang Kosong',
        message: 'Tambahkan produk ke keranjang terlebih dahulu'
      });
      return;
    }

    if (paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < finalTotal)) {
      showNotification({
        type: 'error',
        title: 'Pembayaran Tidak Mencukupi',
        message: 'Jumlah uang yang diterima tidak mencukupi'
      });
      return;
    }

    const transactionData = {
      items: cart,
      subtotal: totalAmount,
      tax: tax,
      total: finalTotal,
      paymentMethod,
      receivedAmount: paymentMethod === 'cash' ? parseFloat(receivedAmount) : finalTotal,
      change: paymentMethod === 'cash' ? parseFloat(receivedAmount) - finalTotal : 0,
      customerName: customerName || 'Guest',
      customerPhone: customerPhone || ''
    };

    const transaction = processTransaction(transactionData);
    setLastTransaction(transaction);
    setShowReceipt(true);
    setReceivedAmount('');
    setCustomerName('');
    setCustomerPhone('');

    showNotification({
      type: 'success',
      title: 'Transaksi Berhasil',
      message: `Transaksi #${transaction.id} berhasil diproses`
    });
  };

  const quickAddToCart = (item, quantity = 1) => {
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    showNotification({
      type: 'success',
      title: 'Produk Ditambahkan',
      message: `${item.name} x${quantity} ditambahkan ke keranjang`
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method !== 'cash') {
      setReceivedAmount(finalTotal.toString());
    } else {
      setReceivedAmount('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Items */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Point of Sale</h1>
          <div className="flex space-x-2">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors relative ${
                  selectedCategory === category
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {category}
                <span className="absolute -top-2 -right-2 text-xs text-white/50">
                  F{index + 1}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-4 hover:bg-white/15 transition-colors">
                <div className="aspect-w-16 aspect-h-9 mb-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">{item.name}</h3>
                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-white font-bold">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-white/60 text-xs">Stok: {item.stock}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => quickAddToCart(item)}
                      disabled={item.stock === 0}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => quickAddToCart(item, 5)}
                      disabled={item.stock < 5}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart and Checkout */}
      <div className="space-y-6">
        {/* Customer Info */}
        <GlassCard className="p-4">
          <h3 className="text-white font-medium mb-3">Informasi Pelanggan</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nama pelanggan (opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
            <input
              type="tel"
              placeholder="No. telepon (opsional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
          </div>
        </GlassCard>

        {/* Cart */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Keranjang</h2>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiShoppingCart} className="h-5 w-5 text-white" />
              <span className="text-white font-medium">{totalItems}</span>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-white/70 text-center py-8">Keranjang kosong</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{item.name}</h4>
                    <p className="text-white/70 text-xs">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-200 p-1 rounded"
                    >
                      <SafeIcon icon={FiMinus} className="h-3 w-3" />
                    </button>
                    <span className="text-white font-medium w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-200 p-1 rounded"
                    >
                      <SafeIcon icon={FiPlus} className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 p-1 rounded ml-2"
                    >
                      <SafeIcon icon={FiTrash2} className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/20 pt-4 mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Subtotal:</span>
              <span className="text-white">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Pajak (10%):</span>
              <span className="text-white">Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg">
              <span className="text-white">Total:</span>
              <span className="text-white">Rp {finalTotal.toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Tunai', icon: FiCreditCard },
                    { value: 'card', label: 'Kartu', icon: FiCreditCard },
                    { value: 'digital', label: 'Digital', icon: FiCreditCard }
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => handlePaymentMethodChange(method.value)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                        paymentMethod === method.value
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/15'
                      }`}
                    >
                      <SafeIcon icon={method.icon} className="h-4 w-4 mb-1" />
                      <span className="text-xs">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Uang Diterima
                  </label>
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Masukkan jumlah uang"
                  />
                  {receivedAmount && parseFloat(receivedAmount) >= finalTotal && (
                    <p className="text-green-400 text-sm mt-2">
                      Kembalian: Rp {(parseFloat(receivedAmount) - finalTotal).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Checkout (F10)
                </button>
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <PrintableReceipt
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default Cashier;