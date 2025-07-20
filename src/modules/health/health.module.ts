import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { Health } from './entities/health.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { Auth } from 'src/modules/auth/entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Health, Auth]), AuthModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
