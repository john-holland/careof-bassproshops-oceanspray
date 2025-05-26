import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Fish } from './fish.entity';

@Entity('fish_tracking')
export class FishTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  species: string;

  @Column('decimal', { precision: 10, scale: 2 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 2 })
  longitude: number;

  @Column('decimal', { precision: 10, scale: 2 })
  depth: number;

  @Column({ length: 50 })
  status: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  fish_id: number;

  @ManyToOne(() => Fish)
  @JoinColumn({ name: 'fish_id' })
  fish: Fish;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 