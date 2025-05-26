import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('stalls')
export class Stall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  location: string;

  @Column({ length: 100 })
  stall_type: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ default: 0 })
  current_occupancy: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 