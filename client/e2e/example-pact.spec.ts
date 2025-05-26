import { Pact } from '@pact-foundation/pact';
import { TestMixin } from '../../test_utils/test_mixin';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

// Initialize the test mixin
const testMixin = new TestMixin(__filename);

// Update test index with the command
testMixin.indexTest('cd client && npm test -- e2e/example-pact.spec.ts');

// Define the consumer and provider
const consumer = new Pact({
  consumer: 'client-consumer',
  provider: 'data-service',
  port: 1234,
  log: './logs/client-pact.log',
  dir: './pacts',
  logLevel: 'info',
  spec: 2
});

// Start the fishery-mock and uav-mock services before running tests
beforeAll(async () => {
  const { execSync } = require('child_process');
  execSync('docker-compose -f docker-compose.pact.yml up -d fishery-mock uav-mock', { stdio: 'inherit' });
  // Wait for the services to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
});

// Clean up after tests
afterAll(async () => {
  const { execSync } = require('child_process');
  execSync('docker-compose -f docker-compose.pact.yml down', { stdio: 'inherit' });
});

describe('Client Pact Tests', () => {
  beforeAll(async () => {
    await consumer.setup();
  });

  afterAll(async () => {
    await consumer.finalize();
  });

  it('should get user data', async () => {
    const expectedBody = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      is_active: true
    };

    await consumer.addInteraction({
      state: 'a user exists',
      uponReceiving: 'a request for user data',
      withRequest: {
        method: 'GET',
        path: '/api/users/1'
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: expectedBody
      }
    });

    const response = await fetch('http://localhost:1234/api/users/1');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(expectedBody);
  });
}); 