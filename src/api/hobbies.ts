const API_BASE = import.meta.env.VITE_API_BASE_URL + '/api/users';
export const addHobbyToUser = async (userId: string, hobbyId: string) => {
  const res = await fetch(`${API_BASE}/${userId}/hobbies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hobbyId }),
  });
  if (!res.ok) throw new Error('Failed to add hobby');
  return res.json();
};

export const removeHobbyFromUser = async (userId: string, hobbyId: string) => {
  const res = await fetch(`${API_BASE}/${userId}/hobbies/${hobbyId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove hobby');
  return res.json();
};
// Get all available hobbies
export const getAllHobbies = async () => {
  const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/hobbies');
  if (!res.ok) throw new Error('Failed to fetch hobbiesdad');
  return res.json();
};