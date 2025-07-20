import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '../../common/config/jwt.config';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { PassportModule } from '@nestjs/passport';
import jwtRefreshConfig from '../../common/config/jwt-refresh.config';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt.guard';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { ProfileController } from './profile.controller';
import { Health } from '../../modules/health/entities/health.entity';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(jwtRefreshConfig),
    TypeOrmModule.forFeature([Auth, Health]),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: async (jwtConfiguration: ConfigType<typeof jwtConfig>) => {
        return {
          secret: jwtConfiguration.secret,
          signOptions: {
            expiresIn: jwtConfiguration.expiresIn,
          },
        };
      },
      inject: [jwtConfig.KEY],
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [
    AuthService,
    LocalAuthGuard,
    JwtAuthGuard,
    JwtStrategy,
    LocalStrategy,
    RefreshJwtAuthGuard,
    RefreshJwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
