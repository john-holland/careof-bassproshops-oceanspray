import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('flight_plans')
export class FlightPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  plan_name: string;

  @Column({ length: 50 })
  source: string;

  @Column('jsonb')
  plan_data: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 