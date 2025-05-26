import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Environmental Test API', () => {
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

  describe('GET /data/environmental-tests', () => {
    it('should return a list of environmental tests', async () => {
      const expectedTests = [
        {
          id: 1,
          test_name: 'Water Quality Check',
          temperature: 22.5,
          humidity: 65.0,
          pressure: 1013.2,
          location: 'Main Harbor',
          notes: 'Regular water quality check',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'environmental tests exist',
        uponReceiving: 'a request for environmental tests',
        withRequest: {
          method: 'GET',
          path: '/data/environmental-tests',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedTests,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/environmental-tests')
        .expect(200);

      expect(response.body).toEqual(expectedTests);
    });
  });

  describe('POST /data/environmental-tests', () => {
    it('should create a new environmental test', async () => {
      const newTest = {
        test_name: 'Air Quality Check',
        temperature: 23.0,
        humidity: 60.0,
        pressure: 1012.8,
        location: 'North Marina',
        notes: 'Regular air quality check',
      };

      const expectedResponse = {
        id: 2,
        ...newTest,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no environmental tests exist',
        uponReceiving: 'a request to create an environmental test',
        withRequest: {
          method: 'POST',
          path: '/data/environmental-tests',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newTest,
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
        .post('/data/environmental-tests')
        .send(newTest)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 