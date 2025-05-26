import { User } from '../database/entities/user.entity';

export interface Fishery {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  capacity: number;
  current_occupancy: number;
  description?: string;
  user_id?: number;
  user?: User;
  created_at: Date;
  updated_at: Date;
}

export interface FisheryCreate {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  capacity: number;
  current_occupancy: number;
  description?: string;
  user_id?: number;
} 