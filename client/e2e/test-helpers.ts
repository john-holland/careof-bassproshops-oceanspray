import { Pool } from 'pg';
import { Pact } from '@pact-foundation/pact';
import { API_URLS } from '../src/config/api';

// Database setup
export const setupTestDatabase = async () => {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bassproshopssimulation_test',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  // Create test tables if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fish (
      id SERIAL PRIMARY KEY,
      species VARCHAR(255) NOT NULL,
      weight DECIMAL NOT NULL,
      location VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS uav_deployments (
      id SERIAL PRIMARY KEY,
      location VARCHAR(255) NOT NULL,
      purpose VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return pool;
};

// Pact setup for service mocking
export const setupPact = () => {
  const provider = new Pact({
    consumer: 'client',
    provider: 'fishery-service',
    port: 8000,
    log: 'logs/pact.log',
    dir: 'pacts',
    logLevel: 'info',
    spec: 2
  });

  return provider;
};

// Test data helpers
export const createTestFish = async (pool: Pool, fishData: any) => {
  const result = await pool.query(
    'INSERT INTO fish (species, weight, location) VALUES ($1, $2, $3) RETURNING *',
    [fishData.species, fishData.weight, fishData.location]
  );
  return result.rows[0];
};

export const createTestUAVDeployment = async (pool: Pool, deploymentData: any) => {
  const result = await pool.query(
    'INSERT INTO uav_deployments (location, purpose, status) VALUES ($1, $2, $3) RETURNING *',
    [deploymentData.location, deploymentData.purpose, deploymentData.status]
  );
  return result.rows[0];
};

// Cleanup helpers
export const cleanupTestData = async (pool: Pool) => {
  await pool.query('DELETE FROM fish');
  await pool.query('DELETE FROM uav_deployments');
  await pool.end();
}; 