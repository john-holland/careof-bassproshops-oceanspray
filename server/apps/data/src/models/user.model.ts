export interface User {
  id: number;
  username: string;
  email: string;
  hashed_password: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: string;
  is_active?: boolean;
} 