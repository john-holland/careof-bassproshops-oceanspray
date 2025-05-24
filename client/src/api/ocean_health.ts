import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface OceanHealth {
  id: number;
  temperature: number;
  salinity: number;
  ph_level: number;
  pollution_level: number;
  recorded_at: string;
  location: string;
}

export const getOceanHealth = async (): Promise<OceanHealth[]> => {
  const response = await axios.get<OceanHealth[]>(`${API_URL}/api/fishery/ocean-health`);
  return response.data;
};

export const createOceanHealth = async (oceanHealth: Omit<OceanHealth, 'id'>): Promise<OceanHealth> => {
  const response = await axios.post<OceanHealth>(`${API_URL}/api/fishery/ocean-health`, oceanHealth);
  return response.data;
}; 