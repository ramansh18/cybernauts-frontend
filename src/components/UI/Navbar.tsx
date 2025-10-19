import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface NavbarProps {
  onSearch: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  return (
    <motion.nav
      className="w-full bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Left: Title and Subtitle */}
      <div className="flex flex-col">
        <h1 className="text-gray-900 text-3xl font-bold tracking-tight">
          Hobby Management Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">
          Interactive User Relationship & Hobby Management System
        </p>
      </div>

      {/* Right: Search Bar and Legend */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
       
        {/* Legend */}
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-700">Low Score (≤5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm font-medium text-gray-700">High Score (&gt;5)</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;