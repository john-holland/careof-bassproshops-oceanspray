import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Achievement API', () => {
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

  describe('GET /data/achievements', () => {
    it('should return a list of achievements', async () => {
      const expectedAchievements = [
        {
          id: 1,
          name: 'First Catch',
          description: 'Caught your first fish',
          category: 'fishing',
          is_unlocked: true,
          unlocked_at: '2024-03-20T00:00:00.000Z',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'achievements exist',
        uponReceiving: 'a request for achievements',
        withRequest: {
          method: 'GET',
          path: '/data/achievements',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedAchievements,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/achievements')
        .expect(200);

      expect(response.body).toEqual(expectedAchievements);
    });
  });

  describe('POST /data/achievements', () => {
    it('should create a new achievement', async () => {
      const newAchievement = {
        name: 'Master Angler',
        description: 'Caught 100 fish',
        category: 'fishing',
        is_unlocked: false,
        unlocked_at: null,
      };

      const expectedResponse = {
        id: 2,
        ...newAchievement,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no achievements exist',
        uponReceiving: 'a request to create an achievement',
        withRequest: {
          method: 'POST',
          path: '/data/achievements',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newAchievement,
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
        .post('/data/achievements')
        .send(newAchievement)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 