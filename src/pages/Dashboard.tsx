import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/UI/Navbar';
import Toast, { notifySuccess, notifyError } from '../components/UI/Toast';
import Spinner from '../components/UI/Spinner';
import ErrorBoundary from '../components/UI/ErrorBoundary';
import HobbiesList from '../components/Sidebar/HobbiesList';
import { useGraphContext } from '../context/GraphContext';
import { motion } from 'framer-motion';
import Graph from '../components/Graph/Graph';
import UserManagement from '../components/Sidebar/UserManagement';

const Dashboard: React.FC = () => {
  const { users, friendships, loading, error, fetchUsers } = useGraphContext();
  const [searchQuery, setSearchQuery] = useState('');

  // 🔹 Fetch initial graph data
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUsers();
        // notifySuccess('Graph loaded successfully');
      } catch (err) {
        console.error('Failed to fetch users:', err);
        notifyError('Failed to load data');
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // 🔍 Filtered users based on search query - memoized for performance
  const filteredUsers = useMemo(() => 
    users.filter(u =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [users, searchQuery]
  );

  // 🔥 Silent refresh function - doesn't show loading spinner
  const handleSilentRefresh = async () => {
    await fetchUsers(true); // Pass silent=true
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col w-full h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden">
        {/* Top Navbar */}
        <Navbar onSearch={setSearchQuery} />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Hobbies */}
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <HobbiesList />
          </motion.div>

          {/* Center - Graph Visualization */}
          <div className="flex-1 relative bg-white/40 backdrop-blur-sm">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 shadow-sm">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            ) : (
              <Graph 
                users={filteredUsers} 
                friendships={friendships}
                onFriendshipChange={handleSilentRefresh}
              />
            )}
          </div>

          {/* Right Sidebar - User Management */}
          <motion.div
            className="w-64 bg-white border-l border-gray-200 shadow-sm"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <UserManagement />
          </motion.div>
        </div>

        <Toast />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;