import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface Fish {
  id: number;
  species: string;
  size: number;
  weight: number;
  caught_at: string;
  location: string;
  is_sustainable: boolean;
}

export interface OceanHealth {
  id: number;
  temperature: number;
  salinity: number;
  ph_level: number;
  pollution_level: number;
  recorded_at: string;
  location: string;
}

export interface PressureTank {
  id: number;
  pressure: number;
  volume: number;
  last_maintenance: string;
  is_operational: boolean;
}

export const getFish = async (): Promise<Fish[]> => {
  const response = await axios.get<Fish[]>(`${API_URL}/api/fishery/fish`);
  return response.data;
};

export const createFish = async (fish: Omit<Fish, 'id'>): Promise<Fish> => {
  const response = await axios.post<Fish>(`${API_URL}/api/fishery/fish`, fish);
  return response.data;
};

export const getOceanHealth = async (): Promise<OceanHealth[]> => {
  const response = await axios.get<OceanHealth[]>(`${API_URL}/api/fishery/ocean-health`);
  return response.data;
};

export const createOceanHealth = async (oceanHealth: Omit<OceanHealth, 'id'>): Promise<OceanHealth> => {
  const response = await axios.post<OceanHealth>(`${API_URL}/api/fishery/ocean-health`, oceanHealth);
  return response.data;
};

export const getPressureTank = async (): Promise<PressureTank[]> => {
  const response = await axios.get<PressureTank[]>(`${API_URL}/api/fishery/pressure-tank`);
  return response.data;
};

export const createPressureTank = async (pressureTank: Omit<PressureTank, 'id'>): Promise<PressureTank> => {
  const response = await axios.post<PressureTank>(`${API_URL}/api/fishery/pressure-tank`, pressureTank);
  return response.data;
}; 