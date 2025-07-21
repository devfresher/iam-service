import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { capitalizeWords } from '../../../common/utils/string.util';
import { Gender } from '../../../common/enums/gender.enum';
import { Auth } from '../../auth/entities/auth.entity';
import { Appointment } from 'src/modules/appointment/entities/appointment.entity';

@Entity()
export class Health {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ type: 'enum', enum: Gender })
  gender!: Gender;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column()
  authId!: string;

  @ManyToOne(() => Auth, (auth) => auth.healthRecords, {
    onDelete: 'CASCADE',
  })
  auth!: Auth;

  @OneToMany(() => Appointment, (appointment) => appointment.health)
  appointments: Appointment[];

  @BeforeInsert()
  @BeforeUpdate()
  formatFields() {
    if (this.firstName) {
      this.firstName = capitalizeWords(this.firstName);
    }

    if (this.lastName) {
      this.lastName = capitalizeWords(this.lastName);
    }
  }
}
