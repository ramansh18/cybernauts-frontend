const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Link two users (create friendship)
export const linkUsers = async (userId: string, friendId: string) => {
  const res = await fetch(`${API_BASE}/api/users/${userId}/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friendId }),
  });
  if (!res.ok) throw new Error('Failed to link users');
  return res.json();
};

// Unlink two users (remove friendship)
export const unlinkUsers = async (userId: string, friendId: string) => {
  const res = await fetch(`${API_BASE}/api/users/${userId}/unlink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friendId }),
  });
  if (!res.ok) throw new Error('Failed to unlink users');
  return res.json();
};

// Fetch all friendships (for graph edges)
export const getAllFriendships = async () => {
  const res = await fetch(`${API_BASE}/api/friendships`,{
    method:"GET",
  });
  console.log(res);
  if (!res.ok) throw new Error('Failed to fetch friendships');
  return res.json(); // returns array of { user1_id, user2_id, created_at }
};
