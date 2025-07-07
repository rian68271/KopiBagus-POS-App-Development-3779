import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiAlertCircle, FiInfo, FiX } = FiIcons;

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      const notification = {
        id: Date.now(),
        ...event.detail
      };
      setNotifications(prev => [...prev, notification]);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return FiCheck;
      case 'error': return FiAlertCircle;
      case 'info': return FiInfo;
      default: return FiInfo;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-500/30 text-green-200';
      case 'error': return 'bg-red-500/20 border-red-500/30 text-red-200';
      case 'info': return 'bg-blue-500/20 border-blue-500/30 text-blue-200';
      default: return 'bg-blue-500/20 border-blue-500/30 text-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-lg border backdrop-blur-md ${getColors(notification.type)} min-w-[300px] shadow-lg`}
          >
            <div className="flex items-start space-x-3">
              <SafeIcon icon={getIcon(notification.type)} className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-current opacity-60 hover:opacity-100 transition-opacity"
              >
                <SafeIcon icon={FiX} className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Helper function to show notifications
export const showNotification = (notification) => {
  const event = new CustomEvent('showNotification', { detail: notification });
  window.dispatchEvent(event);
};

export default NotificationSystem;