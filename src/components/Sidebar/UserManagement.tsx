import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Edit2, Trash2, X, Search } from 'lucide-react';
import { useGraphContext } from '../../context/GraphContext';
import { notifySuccess, notifyError } from '../UI/Toast';

const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useGraphContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    hobbies: ''
  });

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ username: '', age: '', hobbies: '' });
    setShowCreateForm(false);
    setEditingUserId(null);
  };

  const handleCreateUser = async () => {
    if (!formData.username.trim() || !formData.age) {
      notifyError('Please fill in all required fields');
      return;
    }
    const hobbiesArray = formData.hobbies
        .split(',')
        .map(hobby => hobby.trim())
        .filter(hobby => hobby.length > 0);
    try {
      await addUser({
        username: formData.username.trim(),
        age: parseInt(formData.age),
        hobbies: hobbiesArray
      });
      notifySuccess(`User "${formData.username}" created successfully!`);
      resetForm();
    } catch (err) {
      console.error('Error creating user:', err);
      notifyError('Failed to create user');
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const hobbiesString = user.hobbies && user.hobbies.length > 0 
        ? user.hobbies.map(h => h.name).join(', ')
        : '';
      
      setFormData({
        username: user.username,
        age: user.age.toString(),
        hobbies: hobbiesString
      });
      setEditingUserId(userId);
      setShowCreateForm(true);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUserId || !formData.username.trim() || !formData.age) {
      notifyError('Please fill in all required fields');
      return;
    }
    const hobbiesArray = formData.hobbies
        .split(',')
        .map(hobby => hobby.trim())
        .filter(hobby => hobby.length > 0);
    try {
      await updateUser(editingUserId, {
        username: formData.username.trim(),
        age: parseInt(formData.age),
        hobbies :hobbiesArray
      });
      notifySuccess('User updated successfully!');
      resetForm();
    } catch (err) {
      console.error('Error updating user:', err);
      notifyError('Failed to update user');
    }
  };

 const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete "${username}"?`)) {
      try {
        await deleteUser(userId);
        notifySuccess(`User "${username}" deleted successfully!`);
      } catch (err: any) {
        console.error('Error deleting user:', err);
        // Check if it's a 409 conflict (user has active friendships)
        if (err.isConflict || err.status === 409) {
          notifyError(`Cannot delete "${username}" - user has active friendships. Remove all friendships first.`);
        } else {
          notifyError('Failed to delete user');
        }
      }
    }
  };
  return (
    <div className="w-64 h-full bg-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">User Management</h2>
        </div>
      </div>

      {/* Create User Button */}
      <div className="px-4 py-3 border-b border-gray-200">
        <motion.button
          onClick={() => {
            if (showCreateForm && !editingUserId) {
              setShowCreateForm(false);
            } else if (showCreateForm && editingUserId) {
              resetForm();
            } else {
              setShowCreateForm(true);
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-sm font-medium text-xs"
        >
          {showCreateForm ? (
            <>
              <X className="w-3.5 h-3.5" />
              Cancel
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              Create New User
            </>
          )}
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Create/Edit User Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                  Hobbies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., reading, gaming"
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <motion.button
                onClick={editingUserId ? handleUpdateUser : handleCreateUser}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-3 py-2 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200 shadow-sm font-medium text-xs ${
                  editingUserId 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {editingUserId ? (
                  <>
                    <Edit2 className="w-3 h-3" />
                    Update User
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    Create User
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">
          All Users ({filteredUsers.length})
        </h3>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.02 }}
                className="group p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{user.username}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                      <span>Age: {user.age}</span>
                      <span>•</span>
                      <span>Score: {user.popularityScore}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Friends: {user.friends?.length || 0}
                    </p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      onClick={() => handleEditUser(user.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors duration-200"
                      title="Edit user"
                    >
                      <Edit2 className="w-3 h-3 text-blue-600" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
                      title="Delete user"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Hobbies */}
                {user.hobbies && user.hobbies.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.hobbies.slice(0, 2).map((hobby, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] text-gray-700"
                      >
                        {hobby.name}
                      </span>
                    ))}
                    {user.hobbies.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] text-gray-600">
                        +{user.hobbies.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredUsers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-gray-400 text-xs"
            >
              {searchQuery ? 'No users found matching your search' : 'No users yet. Create your first user!'}
            </motion.div>
          )}
        </div>
      </div>

     
    </div>
  );
};

export default UserManagement;