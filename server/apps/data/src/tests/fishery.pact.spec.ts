import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Fishery API', () => {
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

  describe('GET /data/fisheries', () => {
    it('should return a list of fisheries', async () => {
      const expectedFisheries = [
        {
          id: 1,
          name: 'Pacific Coast Fishery',
          location: 'San Francisco Bay',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          type: 'commercial',
          status: 'active',
          capacity: 1000,
          current_occupancy: 750,
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'fisheries exist',
        uponReceiving: 'a request for fisheries',
        withRequest: {
          method: 'GET',
          path: '/data/fisheries',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedFisheries,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/fisheries')
        .expect(200);

      expect(response.body).toEqual(expectedFisheries);
    });
  });

  describe('POST /data/fisheries', () => {
    it('should create a new fishery', async () => {
      const newFishery = {
        name: 'Atlantic Coast Fishery',
        location: 'Boston Harbor',
        coordinates: {
          latitude: 42.3601,
          longitude: -71.0589,
        },
        type: 'commercial',
        status: 'active',
        capacity: 800,
        current_occupancy: 0,
      };

      const expectedResponse = {
        id: 2,
        ...newFishery,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no fisheries exist',
        uponReceiving: 'a request to create a fishery',
        withRequest: {
          method: 'POST',
          path: '/data/fisheries',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newFishery,
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
        .post('/data/fisheries')
        .send(newFishery)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 