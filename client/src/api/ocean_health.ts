import axios from 'axios';
import { getBaseUrl } from '../config/api';
import { OceanHealth } from './fishery';

export const getOceanHealth = async (): Promise<OceanHealth[]> => {
  const response = await axios.get<OceanHealth[]>(`${getBaseUrl('fishery')}/api/fishery/ocean-health`);
  return response.data;
};

export const createOceanHealth = async (oceanHealth: Omit<OceanHealth, 'id'>): Promise<OceanHealth> => {
  const response = await axios.post<OceanHealth>(`${getBaseUrl('fishery')}/api/fishery/ocean-health`, oceanHealth);
  return response.data;
}; 