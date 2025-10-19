import type { User } from '../types';
const API_BASE = import.meta.env.VITE_API_BASE_URL + '/api/users';

export const getUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const createUser = async (data: { username: string; age: number }): Promise<User> => {
  const res = await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  const res = await fetch(`${API_BASE}/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
};

export const deleteUser = async (userId: string) => {
  const res = await fetch(`${API_BASE}/${userId}`, { method: 'DELETE' });
  if (!res.ok) {
    const error: any = new Error('Failed to delete user');
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};
