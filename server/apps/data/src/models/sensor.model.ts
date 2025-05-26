export interface SensorReading {
  id: number;
  sensor_id: string;
  timestamp: Date;
  value: number;
  type: 'PYR' | 'CURRENT' | 'TEMPERATURE' | 'PH';
  location: {
    x: number;
    y: number;
    z: number;
  };
  orientation: 'UP' | 'DOWN' | 'SIDE';
  is_registered: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CurrentChange {
  id: number;
  tank_id: number;
  timestamp: Date;
  value: number;
  duration: number; // milliseconds
  is_temporary: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FeedingSchedule {
  id: number;
  tank_id: number;
  species: string;
  schedule: {
    times: string[]; // HH:mm format
    amount: number; // in grams
    type: string; // food type
  };
  last_fed: Date;
  next_feeding: Date;
  created_at: Date;
  updated_at: Date;
}

export interface HealthCheck {
  id: number;
  tank_id: number;
  timestamp: Date;
  species: string;
  metrics: {
    temperature: number;
    ph: number;
    oxygen: number;
    ammonia: number;
    nitrite: number;
    nitrate: number;
  };
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  notes: string;
  created_at: Date;
  updated_at: Date;
} 