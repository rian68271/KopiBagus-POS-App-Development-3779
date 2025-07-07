import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;