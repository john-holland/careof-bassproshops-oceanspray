import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataModule } from '../data.module';
import { provider, setupPact, finalizePact } from './pact.setup';

describe('Maintenance Schedule API', () => {
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

  describe('GET /data/maintenance-schedules', () => {
    it('should return a list of maintenance schedules', async () => {
      const expectedSchedules = [
        {
          id: 1,
          schedule_name: 'Monthly Check',
          maintenance_date: '2024-04-01T00:00:00.000Z',
          description: 'Regular monthly maintenance check',
          created_at: '2024-03-20T00:00:00.000Z',
          updated_at: '2024-03-20T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'maintenance schedules exist',
        uponReceiving: 'a request for maintenance schedules',
        withRequest: {
          method: 'GET',
          path: '/data/maintenance-schedules',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedSchedules,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/data/maintenance-schedules')
        .expect(200);

      expect(response.body).toEqual(expectedSchedules);
    });
  });

  describe('POST /data/maintenance-schedules', () => {
    it('should create a new maintenance schedule', async () => {
      const newSchedule = {
        schedule_name: 'Quarterly Inspection',
        maintenance_date: '2024-06-01T00:00:00.000Z',
        description: 'Comprehensive quarterly inspection',
      };

      const expectedResponse = {
        id: 2,
        ...newSchedule,
        created_at: '2024-03-20T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
      };

      await provider.addInteraction({
        state: 'no maintenance schedules exist',
        uponReceiving: 'a request to create a maintenance schedule',
        withRequest: {
          method: 'POST',
          path: '/data/maintenance-schedules',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newSchedule,
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
        .post('/data/maintenance-schedules')
        .send(newSchedule)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
    });
  });
}); 