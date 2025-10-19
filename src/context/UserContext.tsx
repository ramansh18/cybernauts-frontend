import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';
import type { ReactNode } from 'react';

interface UserContextType {
  currentUser: User | null;
  isEditing: boolean;
  formValues: { username: string; age: number };
  selectUser: (user: User) => void;
  updateForm: (values: { username?: string; age?: number }) => void;
  resetForm: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({ username: '', age: 0 });

  const selectUser = (user: User) => {
    setCurrentUser(user);
    setFormValues({ username: user.username, age: user.age });
    setIsEditing(true);
  };

  const updateForm = (values: { username?: string; age?: number }) => {
    setFormValues(prev => ({ ...prev, ...values }));
  };

  const resetForm = () => {
    setCurrentUser(null);
    setFormValues({ username: '', age: 0 });
    setIsEditing(false);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isEditing,
        formValues,
        selectUser,
        updateForm,
        resetForm,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
