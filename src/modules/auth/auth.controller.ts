import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.decorator';
import { ActiveUser } from './types/active-user';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt.guard';

@Public()
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Signed up successfully')
  @Post('/signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // Bypassed default nestjs response and handled manually due to refreshToken passed via cookie
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const user = req.user;
    const result = await this.authService.login(user, res);

    return res.status(HttpStatus.OK).json({
      message: 'Logged in successfully',
      statusCode: HttpStatus.OK,
      data: result,
    });
  }

  // Bypassed default nestjs response and handled manually due to refreshToken passed via cookie
  @UseGuards(RefreshJwtAuthGuard)
  @Post('/refresh')
  async refreshTokens(
    @AuthenticatedUser() user: ActiveUser,
    @Res() res: Response,
  ) {
    const result = await this.authService.refreshTokens(user, res);

    return res.status(HttpStatus.OK).json({
      message: 'Token refreshed successfully',
      statusCode: HttpStatus.OK,
      data: result,
    });
  }
}
