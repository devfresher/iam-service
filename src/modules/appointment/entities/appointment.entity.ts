import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Health } from '../../health/entities/health.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp' })
  appointmentAt!: Date;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ default: 'scheduled' })
  status!: 'scheduled' | 'completed' | 'cancelled';

  @ManyToOne(() => Health, (health) => health.appointments, {
    onDelete: 'CASCADE',
  })
  health?: Health;

  @Column()
  healthId!: string;
}
