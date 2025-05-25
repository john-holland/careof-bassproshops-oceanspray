import axios from 'axios';
import { getBaseUrl } from '../config/api';

export interface UAV {
  id: number;
  status: 'idle' | 'deployed' | 'returning';
  battery_level: number;
  location: string;
  last_maintenance: string;
  is_operational: boolean;
}

export const deployUAV = async (uavId: number): Promise<UAV> => {
  const response = await axios.post<UAV>(`${getBaseUrl('uav')}/api/uav/${uavId}/deploy`);
  return response.data;
};

export const getUAVStatus = async (uavId: number): Promise<UAV> => {
  const response = await axios.get<UAV>(`${getBaseUrl('uav')}/api/uav/${uavId}`);
  return response.data;
}; 