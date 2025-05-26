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

export interface VideoRecording {
  id: number;
  uav_id: number;
  start_time: Date;
  end_time?: Date;
  storage_path: string;
  resolution: string;
  format: string;
  size_bytes: number;
  is_streaming: boolean;
  stream_url?: string;
}

export interface HeightMapData {
  id: number;
  uav_id: number;
  location: string;
  timestamp: Date;
  data: {
    elevation: number;
    depth: number;
    water_current: number;
    temperature: number;
    salinity: number;
  };
}

export interface FloatingDescenderUAV extends UAVDeployment {
  type: 'floating-descender';
  camera_anchor: {
    descent_length: number;
    current_depth: number;
    max_depth: number;
    is_anchored: boolean;
  };
  video_recording?: VideoRecording;
  height_map_data?: HeightMapData;
}

export interface EC2StorageConfig {
  bucket_name: string;
  region: string;
  access_key: string;
  secret_key: string;
  streaming_endpoint: string;
} 