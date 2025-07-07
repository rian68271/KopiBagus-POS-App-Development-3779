import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationSystem from './components/NotificationSystem';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Cashier from './pages/Cashier';
import Reports from './pages/Reports';
import Stock from './pages/Stock';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/cashier" element={<Cashier />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/stock" element={<Stock />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/analytics" element={<Analytics />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <NotificationSystem />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;