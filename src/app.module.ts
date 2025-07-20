import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

import redisConfig from './common/config/redis.config';
import appConfig from './common/config/app.config';
import dbConfig from './common/config/db.config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { createKeyv } from '@keyv/redis';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      load: [redisConfig, appConfig, dbConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (dbConfiguration: ConfigType<typeof dbConfig>) => ({
        type: 'postgres',
        url: dbConfiguration.dbUrl,
        entities: [],
        synchronize: false,
        ssl: { rejectUnauthorized: false },
        autoLoadEntities: true,
      }),
      inject: [dbConfig.KEY],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (
        redisConfiguration: ConfigType<typeof redisConfig>,
      ) => ({
        stores: [
          createKeyv({
            socket: {
              host: redisConfiguration.host,
              port: redisConfiguration.port,
            },
            username: redisConfiguration.username,
            password: redisConfiguration.password,
          }),
        ],
      }),
      inject: [redisConfig.KEY],
    }),
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
