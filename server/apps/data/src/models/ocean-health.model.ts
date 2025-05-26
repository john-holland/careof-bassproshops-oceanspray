export interface OceanHealth {
  id: number;
  temperature: number;
  salinity: number;
  ph_level: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface OceanHealthCreate {
  temperature: number;
  salinity: number;
  ph_level: number;
} 