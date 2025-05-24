import axios from 'axios';

const FISHERY_API_URL = 'http://localhost:5000/api/fishery';
const UAV_API_URL = 'http://localhost:5001/api/uav';

export interface Fish {
  id: number;
  species: string;
  size: number;
  weight: number;
}

export interface OceanHealth {
  id: number;
  temperature: number;
  salinity: number;
  ph_level: number;
}

export interface UAVStatus {
  id: number;
  status: string;
  battery_level: number;
}

export const fetchFish = async (): Promise<Fish[]> => {
  const response = await axios.get<Fish[]>(`${FISHERY_API_URL}/fish`);
  return response.data;
};

export const fetchOceanHealth = async (): Promise<OceanHealth[]> => {
  const response = await axios.get<OceanHealth[]>(`${FISHERY_API_URL}/ocean-health`);
  return response.data;
};

export const deployUAV = async (location: string): Promise<UAVStatus> => {
  const response = await axios.post<UAVStatus>(`${UAV_API_URL}/deploy`, { location });
  return response.data;
};

export const fetchUAVStatus = async (): Promise<UAVStatus[]> => {
  const response = await axios.get<UAVStatus[]>(`${UAV_API_URL}/status`);
  return response.data;
}; 