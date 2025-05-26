import { Request, Response } from 'express';
import { SensorService } from '../services/sensor.service';
import { SensorReading, CurrentChange, FeedingSchedule, HealthCheck } from '../models/sensor.model';

export class SensorController {
  private sensorService: SensorService;

  constructor() {
    this.sensorService = SensorService.getInstance();
  }

  async recordSensorReading(req: Request, res: Response) {
    try {
      const reading: Omit<SensorReading, 'id' | 'created_at' | 'updated_at'> = req.body;
      const result = await this.sensorService.recordSensorReading(reading);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to record sensor reading' });
    }
  }

  async processPYRReading(req: Request, res: Response) {
    try {
      const { reading, detections } = req.body;
      await this.sensorService.processPYRReading(reading, detections);
      res.json({ message: 'PYR reading processed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process PYR reading' });
    }
  }

  async createCurrentChange(req: Request, res: Response) {
    try {
      const change: Omit<CurrentChange, 'id' | 'created_at' | 'updated_at'> = req.body;
      const result = await this.sensorService.createTemporaryCurrentChange(change);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create current change' });
    }
  }

  async updateFeedingSchedule(req: Request, res: Response) {
    try {
      const schedule: Omit<FeedingSchedule, 'id' | 'created_at' | 'updated_at'> = req.body;
      const result = await this.sensorService.updateFeedingSchedule(schedule);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update feeding schedule' });
    }
  }

  async recordHealthCheck(req: Request, res: Response) {
    try {
      const check: Omit<HealthCheck, 'id' | 'created_at' | 'updated_at'> = req.body;
      const result = await this.sensorService.recordHealthCheck(check);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to record health check' });
    }
  }

  async getCurrentFeedingSchedule(req: Request, res: Response) {
    try {
      const { tankId, species } = req.params;
      const schedule = await this.sensorService.getFeedingSchedule(Number(tankId), species);
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get feeding schedule' });
    }
  }

  async getLatestHealthCheck(req: Request, res: Response) {
    try {
      const { tankId } = req.params;
      const check = await this.sensorService.getLatestHealthCheck(Number(tankId));
      res.json(check);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get latest health check' });
    }
  }

  async registerSensor(req: Request, res: Response) {
    try {
      const { sensorId, orientation, location } = req.body;
      await this.sensorService.registerSensor(sensorId, orientation, location);
      res.json({ message: 'Sensor registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register sensor' });
    }
  }

  async getRegisteredSensors(req: Request, res: Response) {
    try {
      const sensors = await this.sensorService.getRegisteredSensors();
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get registered sensors' });
    }
  }
} 