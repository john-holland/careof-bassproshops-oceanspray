import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Fish API', () => {
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

  describe('GET /data/fish', () => {
    it('should return a list of fish', async () => {
      const expectedFish = [
        {
          id: 1,
          species: 'Tuna',
          weight: 15.5,
          length: 120.0,
          location: 'Pacific Ocean',
          status: 'active',
          notes: 'Healthy specimen',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'fish exist',
        uponReceiving: 'a request for fish',
        withRequest: {
          method: 'GET',
          path: '/data/fish',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedFish,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/fish')
        .expect(200);

      expect(response.body).toEqual(expectedFish);
    });
  });

  describe('POST /data/fish', () => {
    it('should create a new fish record', async () => {
      const newFish = {
        species: 'Salmon',
        weight: 8.2,
        length: 75.0,
        location: 'Atlantic Ocean',
        status: 'active',
        notes: 'Wild caught',
      };

      const expectedResponse = {
        id: 2,
        ...newFish,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no fish exist',
        uponReceiving: 'a request to create a fish record',
        withRequest: {
          method: 'POST',
          path: '/data/fish',
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
          body: expectedResponse,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/data/fish')
        .send(newFish)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 