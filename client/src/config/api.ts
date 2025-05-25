import { Pact } from '@pact-foundation/pact';

// Environment configuration
const isPactMode = process.env.REACT_APP_PACT_MODE === 'true';

// Service configurations
interface ServiceConfig {
  baseUrl: string;
  pactPort?: number;
  pactHost?: string;
}

interface ApiConfig {
  fishery: ServiceConfig;
  uav: ServiceConfig;
  pactBroker?: {
    url: string;
  };
}

// Default configuration
const defaultConfig: ApiConfig = {
  fishery: {
    baseUrl: process.env.REACT_APP_FISHERY_API_URL || 'http://localhost:8000',
    pactPort: 5000,
    pactHost: 'localhost'
  },
  uav: {
    baseUrl: process.env.REACT_APP_UAV_API_URL || 'http://localhost:8001',
    pactPort: 5001,
    pactHost: 'localhost'
  },
  pactBroker: {
    url: process.env.REACT_APP_PACT_BROKER_URL || 'http://localhost:9292'
  }
};

// PACT configuration
const pactConfig = {
  consumer: 'client',
  provider: {
    fishery: 'fishery-service',
    uav: 'uav-service'
  },
  port: {
    fishery: defaultConfig.fishery.pactPort,
    uav: defaultConfig.uav.pactPort
  },
  host: {
    fishery: defaultConfig.fishery.pactHost,
    uav: defaultConfig.uav.pactHost
  }
};

// Create PACT instances if in PACT mode
const createPactInstance = (provider: 'fishery' | 'uav') => {
  if (!isPactMode) return null;
  
  return new Pact({
    consumer: pactConfig.consumer,
    provider: pactConfig.provider[provider],
    port: pactConfig.port[provider],
    host: pactConfig.host[provider],
    log: process.env.REACT_APP_PACT_LOG_LEVEL || 'info',
    dir: process.env.REACT_APP_PACT_DIR || './pacts',
    spec: 2
  });
};

// Export configuration and PACT instances
export const apiConfig = defaultConfig;
export const fisheryPact = createPactInstance('fishery');
export const uavPact = createPactInstance('uav');

// Helper function to get the correct base URL based on mode
export const getBaseUrl = (service: 'fishery' | 'uav'): string => {
  if (isPactMode) {
    return `http://${pactConfig.host[service]}:${pactConfig.port[service]}`;
  }
  return apiConfig[service].baseUrl;
};

// Export environment information
export const environment = {
  isPactMode,
  pactBrokerUrl: defaultConfig.pactBroker?.url
};

export const API_URLS = {
  FISHERY: 'http://localhost:8000/api/fishery',
  UAV: 'http://localhost:8001/api/uav'
} as const;

export const API_ENDPOINTS = {
  FISHERY: {
    HEALTH: '/health',
    FISH: '/fish',
    OCEAN_HEALTH: '/ocean-health',
    PRESSURE_TANK: '/pressure-tank'
  },
  UAV: {
    HEALTH: '/health',
    DEPLOYMENTS: '/deployments',
    STATUS: '/status'
  }
} as const; 