import { User } from '../database/entities/user.entity';

export interface Achievement {
  id: number;
  name: string;
  description?: string;
  category?: string;
  is_unlocked: boolean;
  unlocked_at?: Date;
  user_id?: number;
  user?: User;
  created_at: Date;
  updated_at: Date;
}

export interface AchievementCreate {
  name: string;
  description?: string;
  category?: string;
  is_unlocked: boolean;
  unlocked_at?: Date;
  user_id?: number;
} 