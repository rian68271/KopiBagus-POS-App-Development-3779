import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCoffee, FiUser, FiLock } = FiIcons;

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, ROLES } = useAuth();
  const navigate = useNavigate();

  // Demo users with role-based permissions
  const demoUsers = [
    {
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      role: 'ADMIN'
    },
    {
      username: 'kasir',
      password: 'kasir123',
      name: 'Kasir',
      role: 'CASHIER'
    },
    {
      username: 'barista',
      password: 'barista123',
      name: 'Barista',
      role: 'BARISTA'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = demoUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      // Add role permissions from ROLES constant
      const userWithRole = {
        ...user,
        permissions: ROLES[user.role]?.permissions || []
      };
      login(userWithRole);
      navigate('/dashboard');
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <SafeIcon icon={FiCoffee} className="h-16 w-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">KopiBagus</h1>
            <p className="text-white/70">Point of Sale System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <SafeIcon icon={FiUser} className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 backdrop-blur-sm"
            >
              Masuk
            </button>
          </form>

          <div className="mt-8 p-4 bg-white/5 rounded-lg">
            <h3 className="text-white/80 text-sm font-medium mb-2">Demo Akun:</h3>
            <div className="text-white/60 text-xs space-y-1">
              <p>Admin: admin / admin123</p>
              <p>Kasir: kasir / kasir123</p>
              <p>Barista: barista / barista123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;