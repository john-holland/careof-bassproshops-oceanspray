import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('User API', () => {
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

  describe('GET /data/users', () => {
    it('should return a list of users', async () => {
      const expectedUsers = [
        {
          id: 1,
          username: 'john_doe',
          hashed_password: 'hashed_password_here',
          is_active: true,
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'users exist',
        uponReceiving: 'a request for users',
        withRequest: {
          method: 'GET',
          path: '/data/users',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedUsers,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/users')
        .expect(200);

      expect(response.body).toEqual(expectedUsers);
    });
  });

  describe('POST /data/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        username: 'jane_doe',
        hashed_password: 'hashed_password_here',
        is_active: true,
      };

      const expectedResponse = {
        id: 2,
        ...newUser,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no users exist',
        uponReceiving: 'a request to create a user',
        withRequest: {
          method: 'POST',
          path: '/data/users',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newUser,
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
        .post('/data/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 