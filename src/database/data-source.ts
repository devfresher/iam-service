import { Auth } from '../modules/auth/entities/auth.entity';
import { Health } from '../modules/health/entities/health.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Appointment } from '../modules/appointment/entities/appointment.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrationsRun: false,
  logging: true,
  entities: [Auth, Health, Appointment],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});
