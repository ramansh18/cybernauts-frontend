// src/types/index.ts

export interface Hobby {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  age: number;
  popularityScore: number;
  hobbies: Hobby[];
}

export interface Friendship {
  user1_id: string;
  user2_id: string;
  created_at: string;
}
