export interface ProjectionSurface {
  id: number;
  name: string;
  type: 'wall' | 'floor' | 'ceiling';
  width: number;
  height: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  stream_url?: string;
}

export interface Tank {
  id: number;
  name: string;
  dimensions: {
    width: number;
    length: number;
    depth: number;
  };
  location: string;
  surfaces: ProjectionSurface[];
  active_uavs: number[];
  current_strength: number; // in amperes
  current_direction: {
    x: number;
    y: number;
    z: number;
  };
  created_at: Date;
  updated_at: Date;
}

export interface Room {
  id: number;
  name: string;
  type: 'observation' | 'control' | 'research';
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  tanks: Tank[];
  surfaces: ProjectionSurface[];
  created_at: Date;
  updated_at: Date;
}

export interface StreamConfig {
  id: number;
  surface_id: number;
  uav_id: number;
  quality: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FishBehavior {
  id: number;
  tank_id: number;
  timestamp: Date;
  fish_count: number;
  average_speed: number;
  direction: {
    x: number;
    y: number;
    z: number;
  };
  activity_level: 'low' | 'medium' | 'high';
  stress_level: 'low' | 'medium' | 'high';
  created_at: Date;
  updated_at: Date;
}

export interface FishDetection {
  id: number;
  tank_id: number;
  timestamp: Date;
  fish_id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  velocity: {
    x: number;
    y: number;
    z: number;
  };
  confidence: number;
  species: string;
  size: number;
  created_at: Date;
  updated_at: Date;
} 