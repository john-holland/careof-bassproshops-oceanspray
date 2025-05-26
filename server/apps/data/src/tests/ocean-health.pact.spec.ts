import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Ocean Health API', () => {
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

  describe('GET /data/ocean-health', () => {
    it('should return a list of ocean health records', async () => {
      const expectedHealth = [
        {
          id: 1,
          temperature: 22.5,
          salinity: 35.0,
          ph_level: 8.1,
          pollution_level: 0.05,
          location: 'Pacific Ocean',
          recorded_at: '2024-03-20T00:00:00.000Z',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'ocean health records exist',
        uponReceiving: 'a request for ocean health records',
        withRequest: {
          method: 'GET',
          path: '/data/ocean-health',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedHealth,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/ocean-health')
        .expect(200);

      expect(response.body).toEqual(expectedHealth);
    });
  });

  describe('POST /data/ocean-health', () => {
    it('should create a new ocean health record', async () => {
      const newHealth = {
        temperature: 23.0,
        salinity: 34.8,
        ph_level: 8.2,
        pollution_level: 0.04,
        location: 'Atlantic Ocean',
      };

      const expectedResponse = {
        id: 2,
        ...newHealth,
        recorded_at: '2024-03-20T00:00:00.000Z',
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no ocean health records exist',
        uponReceiving: 'a request to create an ocean health record',
        withRequest: {
          method: 'POST',
          path: '/data/ocean-health',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newHealth,
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
        .post('/data/ocean-health')
        .send(newHealth)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 