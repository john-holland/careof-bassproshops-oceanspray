import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Power Reading API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupPact();
    const moduleRef = await Test.createTestingModule({
      imports: [DataModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await finalizePact();
  });

  describe('GET /data/power-readings', () => {
    it('should return a list of power readings', async () => {
      const expectedReadings = [
        {
          id: 1,
          voltage: 220.5,
          current: 10.2,
          power_factor: 0.95,
          location: 'Main Power Station',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'power readings exist',
        uponReceiving: 'a request for power readings',
        withRequest: {
          method: 'GET',
          path: '/data/power-readings',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedReadings,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/power-readings')
        .expect(200);

      expect(response.body).toEqual(expectedReadings);
    });
  });

  describe('POST /data/power-readings', () => {
    it('should create a new power reading', async () => {
      const newReading = {
        voltage: 225.0,
        current: 9.8,
        power_factor: 0.98,
        location: 'Backup Power Station',
      };

      const expectedResponse = {
        id: 2,
        ...newReading,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no power readings exist',
        uponReceiving: 'a request to create a power reading',
        withRequest: {
          method: 'POST',
          path: '/data/power-readings',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newReading,
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedResponse,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/data/power-readings')
        .send(newReading)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 