import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Unstuck Interaction API', () => {
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

  describe('GET /data/unstuck-interactions', () => {
    it('should return a list of unstuck interactions', async () => {
      const expectedInteractions = [
        {
          id: 1,
          location: 'Main Harbor',
          interaction_type: 'manual',
          status: 'resolved',
          resolution_notes: 'Successfully freed the vessel',
          created_at: '2024-03-20T00:00:00.000Z',
          resolved_at: '2024-03-20T01:00:00.000Z',
          updated_at: '2024-03-20T01:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'unstuck interactions exist',
        uponReceiving: 'a request for unstuck interactions',
        withRequest: {
          method: 'GET',
          path: '/data/unstuck-interactions',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedInteractions,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/unstuck-interactions')
        .expect(200);

      expect(response.body).toEqual(expectedInteractions);
    });
  });

  describe('POST /data/unstuck-interactions', () => {
    it('should create a new unstuck interaction', async () => {
      const newInteraction = {
        location: 'North Marina',
        interaction_type: 'automatic',
        status: 'pending',
        resolution_notes: null,
      };

      const expectedResponse = {
        id: 2,
        ...newInteraction,
        created_at: '2024-03-20T00:00:00.000Z',
        resolved_at: null,
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no unstuck interactions exist',
        uponReceiving: 'a request to create an unstuck interaction',
        withRequest: {
          method: 'POST',
          path: '/data/unstuck-interactions',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newInteraction,
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
        .post('/data/unstuck-interactions')
        .send(newInteraction)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 