import { Pact } from '@pact-foundation/pact';
import { setupPact } from './test-helpers';
import { API_URLS } from '../src/config/api';

describe('Pact Tests', () => {
  let provider: Pact;

  beforeAll(async () => {
    provider = setupPact();
    await provider.setup();
  });

  afterAll(async () => {
    await provider.finalize();
  });

  describe('Fishery Service', () => {
    it('should return health status', async () => {
      await provider.addInteraction({
        state: 'service is healthy',
        uponReceiving: 'a request for health status',
        withRequest: {
          method: 'GET',
          path: '/api/fishery/health',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            status: 'healthy',
          },
        },
      });

      const response = await fetch(`${API_URLS.FISHERY}/health`);
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });

    it('should create a new fish record', async () => {
      const newFish = {
        species: 'Test Fish',
        weight: 5.5,
        location: 'Test Location',
      };

      await provider.addInteraction({
        state: 'database is ready',
        uponReceiving: 'a request to create a fish record',
        withRequest: {
          method: 'POST',
          path: '/api/fishery/fish',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newFish,
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            id: 1,
            ...newFish,
            created_at: '2024-03-24T00:00:00Z',
          },
        },
      });

      const response = await fetch(`${API_URLS.FISHERY}/fish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFish),
      });
      const data = await response.json();
      expect(data.species).toBe(newFish.species);
      expect(data.weight).toBe(newFish.weight);
      expect(data.location).toBe(newFish.location);
    });
  });

  describe('UAV Service', () => {
    it('should return health status', async () => {
      await provider.addInteraction({
        state: 'service is healthy',
        uponReceiving: 'a request for health status',
        withRequest: {
          method: 'GET',
          path: '/api/uav/health',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            status: 'healthy',
          },
        },
      });

      const response = await fetch(`${API_URLS.UAV}/health`);
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });

    it('should create a new UAV deployment', async () => {
      const newDeployment = {
        location: 'Test Location',
        purpose: 'Test Purpose',
        status: 'pending',
      };

      await provider.addInteraction({
        state: 'database is ready',
        uponReceiving: 'a request to create a UAV deployment',
        withRequest: {
          method: 'POST',
          path: '/api/uav/deployments',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newDeployment,
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            id: 1,
            ...newDeployment,
            created_at: '2024-03-24T00:00:00Z',
          },
        },
      });

      const response = await fetch(`${API_URLS.UAV}/deployments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDeployment),
      });
      const data = await response.json();
      expect(data.location).toBe(newDeployment.location);
      expect(data.purpose).toBe(newDeployment.purpose);
      expect(data.status).toBe(newDeployment.status);
    });
  });
}); 