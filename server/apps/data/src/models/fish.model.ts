export interface Fish {
  id: number;
  species: string;
  size: number;
  weight: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface FishCreate {
  species: string;
  size: number;
  weight: number;
} 