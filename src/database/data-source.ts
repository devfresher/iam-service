import { Auth } from 'src/modules/auth/entities/auth.entity';
import { Health } from 'src/modules/health/entities/health.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';


dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrationsRun: false,
  logging: true,
  entities: [Auth, Health],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});
