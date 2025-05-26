import { Fish } from '../database/entities/fish.entity';

export interface FishTracking {
  id: number;
  species: string;
  latitude: number;
  longitude: number;
  depth: number;
  status: string;
  notes?: string;
  fish_id?: number;
  fish?: Fish;
  created_at: Date;
  updated_at: Date;
}

export interface FishTrackingCreate {
  species: string;
  latitude: number;
  longitude: number;
  depth: number;
  status: string;
  notes?: string;
  fish_id?: number;
} 