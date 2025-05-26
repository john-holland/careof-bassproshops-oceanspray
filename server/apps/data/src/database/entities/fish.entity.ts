import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('fish')
export class Fish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  species: string;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number;

  @Column('decimal', { precision: 10, scale: 2 })
  length: number;

  @Column({ length: 255 })
  location: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 