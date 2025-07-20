import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Health } from '../../health/entities/health.entity';
import { Role } from 'src/common/enums/role.enum';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  username?: string;

  @OneToMany(() => Health, (health) => health.auth)
  healthRecords?: Health[];

  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'enum', enum: Role, array: true, default: [Role.Patient] })
  roles: Role[];

  @Column({ default: true })
  status!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
