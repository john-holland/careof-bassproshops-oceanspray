import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { DataService } from './data.service';
import { Fish } from './database/entities/fish.entity';
import { User } from './database/entities/user.entity';
import { Fishery } from './database/entities/fishery.entity';
import { FishTracking } from './database/entities/fish-tracking.entity';
import { Achievement } from './database/entities/achievement.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { UserRole } from './dto/user.dto';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  // Fish endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('fish')
  findAllFish(): Promise<Fish[]> {
    return this.dataService.findAllFish();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('fish/:id')
  findOneFish(@Param('id') id: string): Promise<Fish> {
    return this.dataService.findOneFish(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('fish')
  createFish(@Body() fish: Partial<Fish>): Promise<Fish> {
    return this.dataService.createFish(fish);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('fish/:id')
  updateFish(@Param('id') id: string, @Body() fish: Partial<Fish>): Promise<Fish> {
    return this.dataService.updateFish(+id, fish);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('fish/:id')
  removeFish(@Param('id') id: string): Promise<void> {
    return this.dataService.removeFish(+id);
  }

  // User endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users')
  findAllUsers(): Promise<User[]> {
    return this.dataService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users/:id')
  findOneUser(@Param('id') id: string): Promise<User> {
    return this.dataService.findOneUser(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('users')
  createUser(@Body() user: Partial<User>): Promise<User> {
    return this.dataService.createUser(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() user: Partial<User>): Promise<User> {
    return this.dataService.updateUser(+id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('users/:id')
  removeUser(@Param('id') id: string): Promise<void> {
    return this.dataService.removeUser(+id);
  }

  // Fishery endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('fisheries')
  findAllFisheries(): Promise<Fishery[]> {
    return this.dataService.findAllFisheries();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('fisheries/:id')
  findOneFishery(@Param('id') id: string): Promise<Fishery> {
    return this.dataService.findOneFishery(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('fisheries')
  createFishery(@Body() fishery: Partial<Fishery>): Promise<Fishery> {
    return this.dataService.createFishery(fishery);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('fisheries/:id')
  updateFishery(@Param('id') id: string, @Body() fishery: Partial<Fishery>): Promise<Fishery> {
    return this.dataService.updateFishery(+id, fishery);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('fisheries/:id')
  removeFishery(@Param('id') id: string): Promise<void> {
    return this.dataService.removeFishery(+id);
  }

  // Fish Tracking endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('fish-tracking')
  findAllFishTracking(): Promise<FishTracking[]> {
    return this.dataService.findAllFishTracking();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('fish-tracking/:id')
  findOneFishTracking(@Param('id') id: string): Promise<FishTracking> {
    return this.dataService.findOneFishTracking(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('fish-tracking')
  createFishTracking(@Body() tracking: Partial<FishTracking>): Promise<FishTracking> {
    return this.dataService.createFishTracking(tracking);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('fish-tracking/:id')
  updateFishTracking(@Param('id') id: string, @Body() tracking: Partial<FishTracking>): Promise<FishTracking> {
    return this.dataService.updateFishTracking(+id, tracking);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('fish-tracking/:id')
  removeFishTracking(@Param('id') id: string): Promise<void> {
    return this.dataService.removeFishTracking(+id);
  }

  // Achievement endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('achievements')
  findAllAchievements(): Promise<Achievement[]> {
    return this.dataService.findAllAchievements();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('achievements/:id')
  findOneAchievement(@Param('id') id: string): Promise<Achievement> {
    return this.dataService.findOneAchievement(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('achievements')
  createAchievement(@Body() achievement: Partial<Achievement>): Promise<Achievement> {
    return this.dataService.createAchievement(achievement);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('achievements/:id')
  updateAchievement(@Param('id') id: string, @Body() achievement: Partial<Achievement>): Promise<Achievement> {
    return this.dataService.updateAchievement(+id, achievement);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('achievements/:id')
  removeAchievement(@Param('id') id: string): Promise<void> {
    return this.dataService.removeAchievement(+id);
  }
} 