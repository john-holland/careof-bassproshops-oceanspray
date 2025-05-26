import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Fish Tracking API', () => {
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

  describe('GET /data/fish-tracking', () => {
    it('should return a list of fish tracking records', async () => {
      const expectedRecords = [
        {
          id: 1,
          species: 'Tuna',
          latitude: 37.7749,
          longitude: -122.4194,
          depth: 50.0,
          status: 'active',
          notes: 'School of tuna spotted',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'fish tracking records exist',
        uponReceiving: 'a request for fish tracking records',
        withRequest: {
          method: 'GET',
          path: '/data/fish-tracking',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedRecords,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/fish-tracking')
        .expect(200);

      expect(response.body).toEqual(expectedRecords);
    });
  });

  describe('POST /data/fish-tracking', () => {
    it('should create a new fish tracking record', async () => {
      const newRecord = {
        species: 'Salmon',
        latitude: 37.7833,
        longitude: -122.4167,
        depth: 30.0,
        status: 'active',
        notes: 'Salmon migration path',
      };

      const expectedResponse = {
        id: 2,
        ...newRecord,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no fish tracking records exist',
        uponReceiving: 'a request to create a fish tracking record',
        withRequest: {
          method: 'POST',
          path: '/data/fish-tracking',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newRecord,
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
        .post('/data/fish-tracking')
        .send(newRecord)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 