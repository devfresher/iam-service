import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload';
import { AuthService } from '../auth.service';
import { ActiveUser } from '../types/active-user';
import jwtRefreshConfig from 'src/common/config/jwt-refresh.config';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private readonly jwtRefreshConfiguration: ConfigType<
      typeof jwtRefreshConfig
    >,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.refreshToken;
      },
      ignoreExpiration: false,
      secretOrKey: jwtRefreshConfiguration.secret as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<ActiveUser> {
    const refreshToken = req.cookies['refreshToken'];

    const user = await this.authService.validateRefreshToken(
      payload.sub,
      refreshToken,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user as ActiveUser;
  }
}
