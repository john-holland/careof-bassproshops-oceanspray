import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('unstuck_interactions')
export class UnstuckInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  location: string;

  @Column({ length: 100 })
  interaction_type: string;

  @Column({ length: 50, default: 'pending' })
  status: string;

  @Column('text', { nullable: true })
  resolution_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  resolved_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 