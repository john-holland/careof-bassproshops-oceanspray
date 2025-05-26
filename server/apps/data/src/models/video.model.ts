export interface VideoStream {
  id: number;
  uav_id: number;
  surface_id: number;
  quality: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  stream_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface VideoRecording {
  id: number;
  uav_id: number;
  start_time: Date;
  duration: number; // in seconds
  quality: 'low' | 'medium' | 'high';
  status: 'recording' | 'completed' | 'failed';
  file_path: string;
  created_at: Date;
  updated_at: Date;
} 