import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Friendship, Hobby } from '../types';
import * as UsersAPI from '../api/users';
import * as FriendshipsAPI from '../api/friendships';
import * as HobbiesAPI from '../api/hobbies';

interface GraphContextType {
  users: User[];
  friendships: Friendship[];
  hobbies: Hobby[];
  loading: boolean;
  error: string | null;
  fetchUsers: (silent?: boolean) => Promise<void>;
  fetchHobbies: () => Promise<void>;
  addUser: (user: { username: string; age: number; hobbies?: string[] }) => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  linkUsers: (userId1: string, userId2: string) => Promise<void>;
  unlinkUsers: (userId1: string, userId2: string) => Promise<void>;
  addHobbyToUser: (userId: string, hobbyId: string) => Promise<void>;
  removeHobbyFromUser: (userId: string, hobbyId: string) => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users with optional silent mode
  const fetchUsers = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await UsersAPI.getUsers();
      setUsers(data);
      
      const friendshipsData = await FriendshipsAPI.getAllFriendships();
      setFriendships(friendshipsData);
      
      console.log("user data---->>", data);
      console.log("friendship---->>>", friendshipsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch all hobbies
  const fetchHobbies = useCallback(async () => {
    // 🔥 Don't show loading spinner for hobby refreshes
    setError(null);
    try {
      const data = await HobbiesAPI.getAllHobbies();
      setHobbies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hobbies');
    }
  }, []);

  // User actions
  const addUser = useCallback(
    async (user: { username: string; age: number; hobbies?: string[] }) => {
      setLoading(true);
      setError(null);
      try {
        const newUser = await UsersAPI.createUser(user);
        setUsers((prev) => [...prev, newUser]);
        
        // 🔥 Refresh hobbies if user was created with hobbies
        if (user.hobbies && user.hobbies.length > 0) {
          await fetchHobbies();
        }
        
        // 🔥 Also refresh users to get the complete user data with populated hobbies
        await fetchUsers(true);
      } catch (err: any) {
        setError(err.message || 'Failed to create user');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchHobbies, fetchUsers]
  );

  const updateUser = useCallback(
    async (userId: string, data: Partial<User> & { hobbies?: string[] }) => {
      setLoading(true);
      setError(null);
      try {
        const updatedUser = await UsersAPI.updateUser(userId, data);
        setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
        
        // 🔥 Refresh hobbies if user hobbies were updated
        if (data.hobbies && data.hobbies.length > 0) {
          await fetchHobbies();
        }
        
        // 🔥 Refresh users to get complete updated data
        await fetchUsers(true);
      } catch (err: any) {
        setError(err.message || 'Failed to update user');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchHobbies, fetchUsers]
  );

 const deleteUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await UsersAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setFriendships(prev => prev.filter(f => f.user1_id !== userId && f.user2_id !== userId));
    } catch (err: any) {
      // Handle 409 conflict - user has active friendships
      if (err.response?.status === 409) {
        setError(null); // Don't set error for 409
        // Create a custom error object with a flag for 409
        const conflictError: any = new Error('Cannot delete user with active friends');
        conflictError.isConflict = true;
        conflictError.status = 409;
        throw conflictError;
      }
      const errorMessage = err.message || 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Friendships
  const linkUsers = useCallback(async (userId1: string, userId2: string) => {
    setLoading(true);
    setError(null);
    try {
      await FriendshipsAPI.linkUsers(userId1, userId2);
      setFriendships(prev => [...prev, { user1_id: userId1, user2_id: userId2, created_at: new Date().toISOString() }]);
    } catch (err: any) {
      setError(err.message || 'Failed to link users');
    } finally {
      setLoading(false);
    }
  }, []);

  const unlinkUsers = useCallback(async (userId1: string, userId2: string) => {
    setLoading(true);
    setError(null);
    try {
      await FriendshipsAPI.unlinkUsers(userId1, userId2);
      setFriendships(prev => prev.filter(f => !(f.user1_id === userId1 && f.user2_id === userId2)));
    } catch (err: any) {
      setError(err.message || 'Failed to unlink users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Hobbies
  const addHobbyToUser = useCallback(async (userId: string, hobbyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await HobbiesAPI.addHobbyToUser(userId, hobbyId);
      setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
    } catch (err: any) {
      setError(err.message || 'Failed to add hobby');
    } finally {
      setLoading(false);
    }
  }, []);

  const removeHobbyFromUser = useCallback(async (userId: string, hobbyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await HobbiesAPI.removeHobbyFromUser(userId, hobbyId);
      setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
    } catch (err: any) {
      setError(err.message || 'Failed to remove hobby');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
    fetchHobbies();
  }, [fetchUsers, fetchHobbies]);

  return (
    <GraphContext.Provider
      value={{
        users,
        friendships,
        hobbies,
        loading,
        error,
        fetchUsers,
        fetchHobbies,
        addUser,
        updateUser,
        setUsers,
        deleteUser,
        linkUsers,
        unlinkUsers,
        addHobbyToUser,
        removeHobbyFromUser,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

// ✅ Export a proper hook
export const useGraphContext = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (!context) throw new Error('useGraphContext must be used within a GraphProvider');
  return context;
};