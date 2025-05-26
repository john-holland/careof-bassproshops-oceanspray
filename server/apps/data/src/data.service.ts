import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fish } from './database/entities/fish.entity';
import { OceanHealth } from './database/entities/ocean-health.entity';
import { FlightPlan } from './database/entities/flight-plan.entity';
import { Stall } from './database/entities/stall.entity';
import { User } from './database/entities/user.entity';
import { MaintenanceSchedule } from './database/entities/maintenance-schedule.entity';
import { MovementGPSLog } from './database/entities/movement-gps-log.entity';
import { Destination } from './database/entities/destination.entity';
import { UnstuckInteraction } from './database/entities/unstuck-interaction.entity';
import { PowerReading } from './database/entities/power-reading.entity';
import { Achievement } from './database/entities/achievement.entity';
import { EnvironmentalTest } from './database/entities/environmental-test.entity';
import { FishTracking } from './database/entities/fish-tracking.entity';
import { Fishery } from './database/entities/fishery.entity';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Fish)
    private fishRepository: Repository<Fish>,
    @InjectRepository(OceanHealth)
    private oceanHealthRepository: Repository<OceanHealth>,
    @InjectRepository(FlightPlan)
    private flightPlanRepository: Repository<FlightPlan>,
    @InjectRepository(Stall)
    private stallRepository: Repository<Stall>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MaintenanceSchedule)
    private maintenanceScheduleRepository: Repository<MaintenanceSchedule>,
    @InjectRepository(MovementGPSLog)
    private movementGPSLogRepository: Repository<MovementGPSLog>,
    @InjectRepository(Destination)
    private destinationRepository: Repository<Destination>,
    @InjectRepository(UnstuckInteraction)
    private unstuckInteractionRepository: Repository<UnstuckInteraction>,
    @InjectRepository(PowerReading)
    private powerReadingRepository: Repository<PowerReading>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(EnvironmentalTest)
    private environmentalTestRepository: Repository<EnvironmentalTest>,
    @InjectRepository(FishTracking)
    private fishTrackingRepository: Repository<FishTracking>,
    @InjectRepository(Fishery)
    private fisheryRepository: Repository<Fishery>,
  ) {}

  // Fish endpoints
  async findAllFish(): Promise<Fish[]> {
    return this.fishRepository.find();
  }

  async findOneFish(id: number): Promise<Fish> {
    return this.fishRepository.findOne({ where: { id } });
  }

  async createFish(fish: Partial<Fish>): Promise<Fish> {
    const newFish = this.fishRepository.create(fish);
    return this.fishRepository.save(newFish);
  }

  async updateFish(id: number, fish: Partial<Fish>): Promise<Fish> {
    await this.fishRepository.update(id, fish);
    return this.findOneFish(id);
  }

  async removeFish(id: number): Promise<void> {
    await this.fishRepository.delete(id);
  }

  // Fish Tracking endpoints
  async findAllFishTracking(): Promise<FishTracking[]> {
    return this.fishTrackingRepository.find({ relations: ['fish'] });
  }

  async findOneFishTracking(id: number): Promise<FishTracking> {
    return this.fishTrackingRepository.findOne({ 
      where: { id },
      relations: ['fish']
    });
  }

  async createFishTracking(tracking: Partial<FishTracking>): Promise<FishTracking> {
    const newTracking = this.fishTrackingRepository.create(tracking);
    return this.fishTrackingRepository.save(newTracking);
  }

  async updateFishTracking(id: number, tracking: Partial<FishTracking>): Promise<FishTracking> {
    await this.fishTrackingRepository.update(id, tracking);
    return this.findOneFishTracking(id);
  }

  async removeFishTracking(id: number): Promise<void> {
    await this.fishTrackingRepository.delete(id);
  }

  // Fishery endpoints
  async findAllFisheries(): Promise<Fishery[]> {
    return this.fisheryRepository.find({ relations: ['user'] });
  }

  async findOneFishery(id: number): Promise<Fishery> {
    return this.fisheryRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
  }

  async createFishery(fishery: Partial<Fishery>): Promise<Fishery> {
    const newFishery = this.fisheryRepository.create(fishery);
    return this.fisheryRepository.save(newFishery);
  }

  async updateFishery(id: number, fishery: Partial<Fishery>): Promise<Fishery> {
    await this.fisheryRepository.update(id, fishery);
    return this.findOneFishery(id);
  }

  async removeFishery(id: number): Promise<void> {
    await this.fisheryRepository.delete(id);
  }

  // Achievement endpoints
  async findAllAchievements(): Promise<Achievement[]> {
    return this.achievementRepository.find({ relations: ['user'] });
  }

  async findOneAchievement(id: number): Promise<Achievement> {
    return this.achievementRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
  }

  async createAchievement(achievement: Partial<Achievement>): Promise<Achievement> {
    const newAchievement = this.achievementRepository.create(achievement);
    return this.achievementRepository.save(newAchievement);
  }

  async updateAchievement(id: number, achievement: Partial<Achievement>): Promise<Achievement> {
    await this.achievementRepository.update(id, achievement);
    return this.findOneAchievement(id);
  }

  async removeAchievement(id: number): Promise<void> {
    await this.achievementRepository.delete(id);
  }

  // User endpoints
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneUser(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOneUserByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async createUser(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    await this.userRepository.update(id, user);
    return this.findOneUser(id);
  }

  async removeUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // Ocean Health endpoints
  async findAllOceanHealth(): Promise<OceanHealth[]> {
    return this.oceanHealthRepository.find();
  }

  async findOneOceanHealth(id: number): Promise<OceanHealth> {
    return this.oceanHealthRepository.findOne({ where: { id } });
  }

  async createOceanHealth(health: Partial<OceanHealth>): Promise<OceanHealth> {
    const newHealth = this.oceanHealthRepository.create(health);
    return this.oceanHealthRepository.save(newHealth);
  }

  // Add similar methods for other entities...
} 