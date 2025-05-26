import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Destination API', () => {
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

  describe('GET /data/destinations', () => {
    it('should return a list of destinations', async () => {
      const expectedDestinations = [
        {
          id: 1,
          name: 'Main Harbor',
          location: 'San Francisco Bay',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          type: 'harbor',
          status: 'active',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'destinations exist',
        uponReceiving: 'a request for destinations',
        withRequest: {
          method: 'GET',
          path: '/data/destinations',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedDestinations,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/destinations')
        .expect(200);

      expect(response.body).toEqual(expectedDestinations);
    });
  });

  describe('POST /data/destinations', () => {
    it('should create a new destination', async () => {
      const newDestination = {
        name: 'North Marina',
        location: 'San Francisco Bay',
        coordinates: {
          latitude: 37.7833,
          longitude: -122.4167,
        },
        type: 'marina',
        status: 'active',
      };

      const expectedResponse = {
        id: 2,
        ...newDestination,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no destinations exist',
        uponReceiving: 'a request to create a destination',
        withRequest: {
          method: 'POST',
          path: '/data/destinations',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newDestination,
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
        .post('/data/destinations')
        .send(newDestination)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 