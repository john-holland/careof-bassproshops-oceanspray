import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('fisheries')
export class Fishery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  location: string;

  @Column('decimal', { precision: 10, scale: 2 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 2 })
  longitude: number;

  @Column({ length: 50 })
  status: string;

  @Column('decimal', { precision: 10, scale: 2 })
  capacity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  current_occupancy: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 