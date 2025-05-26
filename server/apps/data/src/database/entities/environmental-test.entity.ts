import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('environmental_tests')
export class EnvironmentalTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  test_name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  temperature: number;

  @Column('decimal', { precision: 10, scale: 2 })
  humidity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pressure: number;

  @Column({ length: 255 })
  location: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 