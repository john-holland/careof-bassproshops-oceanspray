import axios from 'axios';

const API_URL = process.env.REACT_APP_UAV_API_URL || 'http://localhost:5001';

export interface UAVDeployment {
  location: string;
}

export interface UAVStatus {
  id: number;
  status: string;
  battery_level: number;
  location: string;
  updated_at: string;
}

export const deployUAV = async (deployment: UAVDeployment): Promise<UAVStatus> => {
  const response = await axios.post<UAVStatus>(`${API_URL}/api/uav/deploy`, deployment);
  return response.data;
};

export const getUAVStatus = async (): Promise<UAVStatus[]> => {
  const response = await axios.get<UAVStatus[]>(`${API_URL}/api/uav/status`);
  return response.data;
}; 