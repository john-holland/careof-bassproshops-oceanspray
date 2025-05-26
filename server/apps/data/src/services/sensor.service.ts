import { SensorReading, CurrentChange, FeedingSchedule, HealthCheck } from '../models/sensor.model';
import { FishDetection } from '../models/room.model';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SensorService {
  private static instance: SensorService;
  private currentChanges: Map<number, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): SensorService {
    if (!SensorService.instance) {
      SensorService.instance = new SensorService();
    }
    return SensorService.instance;
  }

  async recordSensorReading(reading: Omit<SensorReading, 'id' | 'created_at' | 'updated_at'>): Promise<SensorReading> {
    return prisma.sensorReading.create({
      data: {
        ...reading,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async processPYRReading(reading: SensorReading, detections: FishDetection[]): Promise<void> {
    // Analyze PYR reading in context of fish detections
    const activeFish = detections.filter(d => d.confidence > 0.7);
    
    if (activeFish.length > 0) {
      // Calculate average position of detected fish
      const avgX = activeFish.reduce((sum, fish) => sum + fish.position.x, 0) / activeFish.length;
      const avgY = activeFish.reduce((sum, fish) => sum + fish.position.y, 0) / activeFish.length;
      
      // Determine current direction based on sensor orientation and fish position
      let currentValue = 0;
      let currentDuration = 5000; // 5 seconds default

      if (reading.orientation === 'UP') {
        // If fish are detected near the surface, create downward current
        if (avgY < 0.3) { // Fish are in upper 30% of tank
          currentValue = 0.5; // Strong downward current
          currentDuration = 3000; // Shorter duration for surface movement
        }
      } else if (reading.orientation === 'DOWN') {
        // If fish are detected near the bottom, create upward current
        if (avgY > 0.7) { // Fish are in lower 30% of tank
          currentValue = -0.5; // Strong upward current
          currentDuration = 3000;
        }
      } else if (reading.orientation === 'SIDE') {
        // For side sensors, create horizontal current based on fish position
        if (avgX < 0.3) { // Fish are on left side
          currentValue = 0.3; // Moderate rightward current
        } else if (avgX > 0.7) { // Fish are on right side
          currentValue = -0.3; // Moderate leftward current
        }
      }

      // Only create current if we have a non-zero value
      if (currentValue !== 0) {
        await this.createTemporaryCurrentChange({
          tank_id: activeFish[0].tank_id,
          value: currentValue,
          duration: currentDuration,
          is_temporary: true,
          timestamp: new Date()
        });
      }
    }
  }

  async createTemporaryCurrentChange(change: Omit<CurrentChange, 'id' | 'created_at' | 'updated_at'>): Promise<CurrentChange> {
    const currentChange = await prisma.currentChange.create({
      data: {
        ...change,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Schedule automatic reset of current
    const timeout = setTimeout(async () => {
      await this.resetCurrent(change.tank_id);
      this.currentChanges.delete(change.tank_id);
    }, change.duration);

    this.currentChanges.set(change.tank_id, timeout);

    return currentChange;
  }

  async resetCurrent(tankId: number): Promise<void> {
    await prisma.currentChange.create({
      data: {
        tank_id: tankId,
        value: 0,
        duration: 0,
        is_temporary: false,
        timestamp: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async updateFeedingSchedule(schedule: Omit<FeedingSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<FeedingSchedule> {
    return prisma.feedingSchedule.upsert({
      where: {
        tank_id_species: {
          tank_id: schedule.tank_id,
          species: schedule.species
        }
      },
      update: {
        ...schedule,
        updated_at: new Date()
      },
      create: {
        ...schedule,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async recordHealthCheck(check: Omit<HealthCheck, 'id' | 'created_at' | 'updated_at'>): Promise<HealthCheck> {
    // Calculate health status based on metrics
    const status = this.calculateHealthStatus(check.metrics);
    
    return prisma.healthCheck.create({
      data: {
        ...check,
        status,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  private calculateHealthStatus(metrics: HealthCheck['metrics']): HealthCheck['status'] {
    // Define thresholds for different metrics
    const thresholds = {
      temperature: { min: 20, max: 28 },
      ph: { min: 6.5, max: 8.5 },
      oxygen: { min: 5, max: 8 },
      ammonia: { max: 0.25 },
      nitrite: { max: 0.5 },
      nitrate: { max: 40 }
    };

    let criticalCount = 0;
    let warningCount = 0;

    // Check each metric against thresholds
    if (metrics.temperature < thresholds.temperature.min || metrics.temperature > thresholds.temperature.max) {
      criticalCount++;
    } else if (Math.abs(metrics.temperature - 24) > 2) {
      warningCount++;
    }

    if (metrics.ph < thresholds.ph.min || metrics.ph > thresholds.ph.max) {
      criticalCount++;
    } else if (Math.abs(metrics.ph - 7.5) > 0.5) {
      warningCount++;
    }

    if (metrics.oxygen < thresholds.oxygen.min) {
      criticalCount++;
    } else if (metrics.oxygen < thresholds.oxygen.max) {
      warningCount++;
    }

    if (metrics.ammonia > thresholds.ammonia.max) {
      criticalCount++;
    } else if (metrics.ammonia > thresholds.ammonia.max * 0.8) {
      warningCount++;
    }

    if (metrics.nitrite > thresholds.nitrite.max) {
      criticalCount++;
    } else if (metrics.nitrite > thresholds.nitrite.max * 0.8) {
      warningCount++;
    }

    if (metrics.nitrate > thresholds.nitrate.max) {
      criticalCount++;
    } else if (metrics.nitrate > thresholds.nitrate.max * 0.8) {
      warningCount++;
    }

    if (criticalCount > 0) return 'CRITICAL';
    if (warningCount > 0) return 'WARNING';
    return 'HEALTHY';
  }

  async getFeedingSchedule(tankId: number, species: string): Promise<FeedingSchedule | null> {
    return prisma.feedingSchedule.findUnique({
      where: {
        tank_id_species: {
          tank_id: tankId,
          species
        }
      }
    });
  }

  async getLatestHealthCheck(tankId: number): Promise<HealthCheck | null> {
    return prisma.healthCheck.findFirst({
      where: {
        tank_id: tankId
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  async registerSensor(sensorId: string, orientation: 'UP' | 'DOWN' | 'SIDE', location: { x: number; y: number; z: number }): Promise<void> {
    await prisma.sensorReading.updateMany({
      where: {
        sensor_id: sensorId,
        is_registered: false
      },
      data: {
        orientation,
        location,
        is_registered: true
      }
    });
  }

  async getRegisteredSensors(): Promise<Array<{ sensor_id: string; orientation: string; location: { x: number; y: number; z: number } }>> {
    const sensors = await prisma.sensorReading.findMany({
      where: {
        is_registered: true
      },
      select: {
        sensor_id: true,
        orientation: true,
        location: true
      },
      distinct: ['sensor_id']
    });

    return sensors;
  }
} 