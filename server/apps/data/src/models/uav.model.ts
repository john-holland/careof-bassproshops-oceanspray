export interface UAVStatus {
  id: number;
  status: string;
  battery_level: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UAVDeployment {
  id: number;
  location: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UAVDeploymentCreate {
  location: string;
  status: string;
}

export interface UAVStatusCreate {
  status: string;
  battery_level: number;
} 