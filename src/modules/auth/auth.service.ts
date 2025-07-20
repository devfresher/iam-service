import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from 'src/common/enums/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcryptjs';
import { Auth } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtPayload } from './types/jwt-payload';
import { Response } from 'express';
import { ActiveUser } from './types/active-user';
import jwtRefreshConfig from 'src/common/config/jwt-refresh.config';
import { ConfigType } from '@nestjs/config';
import appConfig from 'src/common/config/app.config';
import { BaseService } from 'src/common/base/base.service';

@Injectable()
export class AuthService extends BaseService<Auth> {
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(jwtRefreshConfig.KEY)
    private readonly jwtRefreshConfiguration: ConfigType<
      typeof jwtRefreshConfig
    >,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    super(authRepository, 'User');
  }

  async signup(dto: SignupDto) {
    const { email, username, password } = dto;

    let [userWthEmail, userWithUsername] = await Promise.all([
      this.authRepository.findOne({
        where: { email },
      }),
      this.authRepository.findOne({
        where: { username },
      }),
    ]);

    if (userWthEmail || userWithUsername) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.authRepository.save({
      email,
      username,
      roles: [Role.Patient],
      password: hashedPassword,
    });

    this.eventEmitter.emit('user.signedUp', user);

    return this.login(user);
  }

  async validateUser(emailOrUsername: string, password: string) {
    const user = await this.authRepository.findOne({
      where: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return null;
    }

    if (!user.status) {
      throw new ForbiddenException('Account deactivated, Reach out to Admin');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: hashedPassword, ...result } = user;
    return result;
  }

  async login(user: Auth, res?: Response) {
    const { accessToken, refreshToken } = await this.generateTokens(user);
    if (res) {
      this.setRefreshTokenCookie(refreshToken, res);
    }

    this.eventEmitter.emit('user.loggedIn', user);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  private async generateTokens(user: ActiveUser) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: ActiveUser) {
    const payload: JwtPayload = { sub: user.id, roles: user.roles };
    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(user: ActiveUser): Promise<string> {
    const payload: JwtPayload = { sub: user.id, roles: user.roles };

    const token = this.jwtService.sign(payload, {
      secret: this.jwtRefreshConfiguration.secret,
      expiresIn: this.jwtRefreshConfiguration.expiresIn,
    });

    const hashedToken = await bcrypt.hash(token, 10);

    const auth = await this.authRepository.findOne({
      where: { id: user.id },
    });

    if (auth) {
      await this.authRepository.update(auth.id, {
        refreshToken: hashedToken,
      });
    }

    return token;
  }

  private setRefreshTokenCookie(token: string, res: Response) {
    const refreshExpires = this.jwtRefreshConfiguration.expiresInDays;

    // Set secure HTTP-only cookie
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: this.appConfiguration.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: refreshExpires * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<Auth | boolean> {
    const auth = await this.authRepository.findOne({
      where: { id: userId },
    });

    if (auth?.refreshToken) {
      const isValid = await bcrypt.compare(refreshToken, auth.refreshToken);
      return isValid && auth;
    }

    return false;
  }

  async refreshTokens(user: ActiveUser, res: Response) {
    const { accessToken, refreshToken } = await this.generateTokens(user);

    this.setRefreshTokenCookie(refreshToken, res);

    return { accessToken };
  }

  async revokeRefreshToken(user: ActiveUser) {
    const auth = await this.authRepository.findOne({
      where: { id: user.id },
    });

    if (auth) {
      auth.refreshToken = null;
      await this.authRepository.save(auth);
    }
  }

  async logout(user: ActiveUser, res: Response) {
    await this.revokeRefreshToken(user);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.appConfiguration.nodeEnv === 'production',
      path: '/',
    });

    return true;
  }
}
