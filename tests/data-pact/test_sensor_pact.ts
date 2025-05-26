import { Consumer, Provider } from '@pact-foundation/pact';
import { TestMixin } from '../../test_utils/test_mixin';
import { SensorReading, CurrentChange, FeedingSchedule, HealthCheck } from '../../server/apps/data/src/models/sensor.model';

const testMixin = new TestMixin();
testMixin.updateTestIndex('pact-test-data');

const consumer = new Consumer('data-service');
const provider = new Provider('sensor-service');

describe('Sensor Service PACT Tests', () => {
  beforeAll(async () => {
    await testMixin.setupPact(consumer, provider);
  });

  afterAll(async () => {
    await testMixin.teardownPact();
  });

  describe('Sensor Registration', () => {
    it('should register a new sensor', async () => {
      const sensorData = {
        sensorId: 'pyr_001',
        orientation: 'UP',
        location: {
          x: 0.5,
          y: 0.9,
          z: 0.5
        }
      };

      await provider.addInteraction({
        state: 'sensor registration is available',
        uponReceiving: 'a request to register a sensor',
        withRequest: {
          method: 'POST',
          path: '/api/sensors/register',
          body: sensorData
        },
        willRespondWith: {
          status: 200,
          body: {
            message: 'Sensor registered successfully'
          }
        }
      });

      const response = await fetch('http://localhost:1234/api/sensors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sensorData)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Sensor registered successfully');
    });
  });

  describe('PYR Reading Processing', () => {
    it('should process PYR reading with fish detections', async () => {
      const reading: SensorReading = {
        id: 1,
        sensor_id: 'pyr_001',
        timestamp: new Date(),
        value: 0.8,
        type: 'PYR',
        location: { x: 0.5, y: 0.9, z: 0.5 },
        orientation: 'UP',
        is_registered: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const detections = [
        {
          id: 1,
          tank_id: 1,
          timestamp: new Date(),
          fish_id: 'fish_001',
          position: { x: 0.3, y: 0.2, z: 0.5 },
          velocity: { x: 0, y: 0, z: 0 },
          confidence: 0.9,
          species: 'salmon',
          size: 0.3,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await provider.addInteraction({
        state: 'PYR processing is available',
        uponReceiving: 'a request to process PYR reading',
        withRequest: {
          method: 'POST',
          path: '/api/sensors/pyr',
          body: { reading, detections }
        },
        willRespondWith: {
          status: 200,
          body: {
            message: 'PYR reading processed successfully'
          }
        }
      });

      const response = await fetch('http://localhost:1234/api/sensors/pyr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reading, detections })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('PYR reading processed successfully');
    });
  });

  describe('Current Changes', () => {
    it('should create a temporary current change', async () => {
      const change: Omit<CurrentChange, 'id' | 'created_at' | 'updated_at'> = {
        tank_id: 1,
        timestamp: new Date(),
        value: 0.5,
        duration: 5000,
        is_temporary: true
      };

      await provider.addInteraction({
        state: 'current change creation is available',
        uponReceiving: 'a request to create current change',
        withRequest: {
          method: 'POST',
          path: '/api/sensors/current',
          body: change
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 1,
            ...change,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });

      const response = await fetch('http://localhost:1234/api/sensors/current', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(change)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tank_id).toBe(change.tank_id);
      expect(data.value).toBe(change.value);
      expect(data.is_temporary).toBe(true);
    });
  });

  describe('Feeding Schedule', () => {
    it('should update feeding schedule', async () => {
      const schedule: Omit<FeedingSchedule, 'id' | 'created_at' | 'updated_at'> = {
        tank_id: 1,
        species: 'salmon',
        schedule: {
          times: ['08:00', '16:00'],
          amount: 100,
          type: 'pellets'
        },
        last_fed: new Date(),
        next_feeding: new Date(Date.now() + 3600000)
      };

      await provider.addInteraction({
        state: 'feeding schedule update is available',
        uponReceiving: 'a request to update feeding schedule',
        withRequest: {
          method: 'POST',
          path: '/api/sensors/feeding',
          body: schedule
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 1,
            ...schedule,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });

      const response = await fetch('http://localhost:1234/api/sensors/feeding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(schedule)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tank_id).toBe(schedule.tank_id);
      expect(data.species).toBe(schedule.species);
      expect(data.schedule).toEqual(schedule.schedule);
    });
  });

  describe('Health Check', () => {
    it('should record health check', async () => {
      const check: Omit<HealthCheck, 'id' | 'created_at' | 'updated_at'> = {
        tank_id: 1,
        timestamp: new Date(),
        species: 'salmon',
        metrics: {
          temperature: 24,
          ph: 7.0,
          oxygen: 6.5,
          ammonia: 0.1,
          nitrite: 0.2,
          nitrate: 20
        },
        status: 'HEALTHY',
        notes: 'All metrics within normal range'
      };

      await provider.addInteraction({
        state: 'health check recording is available',
        uponReceiving: 'a request to record health check',
        withRequest: {
          method: 'POST',
          path: '/api/sensors/health',
          body: check
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 1,
            ...check,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });

      const response = await fetch('http://localhost:1234/api/sensors/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(check)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tank_id).toBe(check.tank_id);
      expect(data.species).toBe(check.species);
      expect(data.metrics).toEqual(check.metrics);
      expect(data.status).toBe('HEALTHY');
    });
  });
}); 