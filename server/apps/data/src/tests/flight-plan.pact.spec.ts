import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Flight Plan API', () => {
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

  describe('GET /data/flight-plans', () => {
    it('should return a list of flight plans', async () => {
      const expectedPlans = [
        {
          id: 1,
          plan_name: 'Morning Survey',
          source: 'UAV',
          plan_data: {
            waypoints: [
              { lat: 37.7749, lng: -122.4194 },
              { lat: 37.7833, lng: -122.4167 },
            ],
            altitude: 100,
            speed: 30,
          },
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'flight plans exist',
        uponReceiving: 'a request for flight plans',
        withRequest: {
          method: 'GET',
          path: '/data/flight-plans',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedPlans,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/flight-plans')
        .expect(200);

      expect(response.body).toEqual(expectedPlans);
    });
  });

  describe('POST /data/flight-plans', () => {
    it('should create a new flight plan', async () => {
      const newPlan = {
        plan_name: 'Evening Survey',
        source: 'UAV',
        plan_data: {
          waypoints: [
            { lat: 37.7749, lng: -122.4194 },
            { lat: 37.7833, lng: -122.4167 },
          ],
          altitude: 150,
          speed: 25,
        },
      };

      const expectedResponse = {
        id: 2,
        ...newPlan,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no flight plans exist',
        uponReceiving: 'a request to create a flight plan',
        withRequest: {
          method: 'POST',
          path: '/data/flight-plans',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newPlan,
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
        .post('/data/flight-plans')
        .send(newPlan)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 