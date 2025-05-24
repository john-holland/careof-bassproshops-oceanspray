export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  timestamp?: Date;
}

export interface OceanHealthMetrics {
  temperature: number;
  salinity: number;
  ph: number;
  oxygenLevel: number;
  pollutionIndex: number;
  fishPopulationDensity: number;
  waterClarity: number;
  currentSpeed: number;
  waveHeight: number;
}

export interface OceanHealthCheck {
  coordinates: GPSCoordinates;
  metrics: OceanHealthMetrics;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical';
  recommendations?: string[];
}

export interface OceanHealthService {
  checkHealth(coordinates: GPSCoordinates): Promise<OceanHealthCheck>;
  getHistoricalData(coordinates: GPSCoordinates, timeRange: { start: Date; end: Date }): Promise<OceanHealthCheck[]>;
  getRecommendations(healthCheck: OceanHealthCheck): Promise<string[]>;
} 