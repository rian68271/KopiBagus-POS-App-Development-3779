import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiFilter, FiX } = FiIcons;

const AdvancedSearch = ({ onSearch, onFilter, filters = {}, placeholder = "Cari..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-3 h-5 w-5 text-white/50" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors relative ${
            showFilters ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          <SafeIcon icon={FiFilter} className="h-5 w-5" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Filter Options</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <SafeIcon icon={FiX} className="h-4 w-4" />
                <span className="text-sm">Clear All</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filters).map(([key, filterConfig]) => (
              <div key={key}>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  {filterConfig.label}
                </label>
                {filterConfig.type === 'select' ? (
                  <select
                    value={activeFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="" className="bg-gray-800">All</option>
                    {filterConfig.options.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filterConfig.type === 'date' ? (
                  <input
                    type="date"
                    value={activeFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                ) : (
                  <input
                    type={filterConfig.type || 'text'}
                    value={activeFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    placeholder={filterConfig.placeholder}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedSearch;