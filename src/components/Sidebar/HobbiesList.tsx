import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Palette } from 'lucide-react';
import type { Hobby } from '../../types';
import { notifySuccess, notifyError } from '../UI/Toast';
import { useGraphContext } from '../../context/GraphContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const HobbiesList: React.FC = () => {
  const { hobbies: contextHobbies, fetchHobbies } = useGraphContext(); // 🔥 Use hobbies from context
  const [filtered, setFiltered] = useState<Hobby[]>([]);
  const [search, setSearch] = useState('');
  const [newHobbyName, setNewHobbyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Update filtered list when context hobbies change
  useEffect(() => {
    setFiltered(contextHobbies);
  }, [contextHobbies]);

  // Filter hobbies based on search
  useEffect(() => {
    const results = contextHobbies.filter((hobby) =>
      hobby && hobby.name && hobby.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, contextHobbies]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, hobby: Hobby) => {
    e.dataTransfer.setData('application/hobby', JSON.stringify(hobby));
  };

  const handleAddHobby = async () => {
    if (!newHobbyName.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/hobbies/`, { name: newHobbyName });
      await fetchHobbies(); // 🔥 Refresh hobbies from context
      notifySuccess(`Hobby "${newHobbyName}" created successfully!`);
      setNewHobbyName('');
    } catch (err) {
      console.error('Error adding hobby:', err);
      notifyError('Failed to create hobby');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHobby = async (hobbyId: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/hobbies/delete/${hobbyId}`);
      await fetchHobbies(); // 🔥 Refresh hobbies from context
      notifySuccess('Hobby deleted successfully!');
    } catch (err) {
      console.error('Error deleting hobby:', err);
      notifyError('Failed to delete hobby');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">Hobby Management</h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Search hobbies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Create New Hobby */}
      <div className="px-4 py-2 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Create New Hobby</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter hobby name"
            value={newHobbyName}
            onChange={(e) => setNewHobbyName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddHobby()}
            className="flex-1 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          <motion.button
            onClick={handleAddHobby}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Hobbies List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-none">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">
          All Hobbies ({filtered.length})
        </h3>

        {loading && <p className="text-center text-gray-400 text-xs mt-4">Loading...</p>}
        {error && <p className="text-center text-red-500 text-xs mt-4">{error}</p>}

        <AnimatePresence mode="popLayout">
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-1">
              {filtered.map((hobby) => (
                <motion.div
                  key={hobby.id}
                  layout
                  draggable
                  onDragStart={(e) => handleDragStart(e, hobby)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group cursor-grab active:cursor-grabbing select-none px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-between"
                >
                  <p className="text-[12px] font-medium text-gray-700 group-hover:text-purple-700 truncate">
                    {hobby.name}
                  </p>
                  <motion.button
                    onClick={() => handleDeleteHobby(hobby.id)}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.1 }}
                    whileTap={{ scale: loading ? 1 : 0.9 }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <motion.p
              className="text-center text-gray-400 text-xs mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No hobbies found
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-amber-50">
        <p className="text-[10px] text-amber-800 leading-relaxed">
          <span className="font-semibold">💡 Tip:</span> Drag hobbies to user nodes in the graph to assign them
        </p>
      </div>
    </div>
  );
};

export default HobbiesList;