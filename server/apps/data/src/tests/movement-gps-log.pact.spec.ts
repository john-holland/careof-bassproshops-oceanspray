import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Movement GPS Log API', () => {
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

  describe('GET /data/movement-gps-logs', () => {
    it('should return a list of movement GPS logs', async () => {
      const expectedLogs = [
        {
          id: 1,
          latitude: 37.7749,
          longitude: -122.4194,
          notes: 'Morning patrol route',
          timestamp: '2024-03-20T00:00:00.000Z',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'movement GPS logs exist',
        uponReceiving: 'a request for movement GPS logs',
        withRequest: {
          method: 'GET',
          path: '/data/movement-gps-logs',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedLogs,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/movement-gps-logs')
        .expect(200);

      expect(response.body).toEqual(expectedLogs);
    });
  });

  describe('POST /data/movement-gps-logs', () => {
    it('should create a new movement GPS log', async () => {
      const newLog = {
        latitude: 37.7833,
        longitude: -122.4167,
        notes: 'Evening patrol route',
      };

      const expectedResponse = {
        id: 2,
        ...newLog,
        timestamp: '2024-03-20T00:00:00.000Z',
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no movement GPS logs exist',
        uponReceiving: 'a request to create a movement GPS log',
        withRequest: {
          method: 'POST',
          path: '/data/movement-gps-logs',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newLog,
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
        .post('/data/movement-gps-logs')
        .send(newLog)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 