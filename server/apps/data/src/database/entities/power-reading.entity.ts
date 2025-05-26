import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('power_readings')
export class PowerReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  voltage: number;

  @Column('decimal', { precision: 10, scale: 2 })
  current: number;

  @Column('decimal', { precision: 10, scale: 2 })
  power_factor: number;

  @Column({ length: 255 })
  location: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 