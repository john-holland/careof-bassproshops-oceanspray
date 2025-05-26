import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Stall API', () => {
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

  describe('GET /data/stalls', () => {
    it('should return a list of stalls', async () => {
      const expectedStalls = [
        {
          id: 1,
          location: 'Main Dock',
          stall_type: 'Fishing',
          status: 'active',
          capacity: 10,
          current_occupancy: 5,
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'stalls exist',
        uponReceiving: 'a request for stalls',
        withRequest: {
          method: 'GET',
          path: '/data/stalls',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedStalls,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/stalls')
        .expect(200);

      expect(response.body).toEqual(expectedStalls);
    });
  });

  describe('POST /data/stalls', () => {
    it('should create a new stall', async () => {
      const newStall = {
        location: 'North Dock',
        stall_type: 'Boating',
        status: 'active',
        capacity: 8,
        current_occupancy: 0,
      };

      const expectedResponse = {
        id: 2,
        ...newStall,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no stalls exist',
        uponReceiving: 'a request to create a stall',
        withRequest: {
          method: 'POST',
          path: '/data/stalls',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newStall,
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
        .post('/data/stalls')
        .send(newStall)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 