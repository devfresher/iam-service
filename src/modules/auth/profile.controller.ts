import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Res,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { AuthenticatedUser } from '../../common/decorators/authenticated-user.decorator';
import { Response } from 'express';
import { ActiveUser } from './types/active-user';

@Controller('/profile')
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Profile retrieved successfully')
  @Get('/')
  async activeUserProfile(@AuthenticatedUser() user: ActiveUser) {
    return user;
  }

  @Post('/logout')
  async logout(@AuthenticatedUser() user: ActiveUser, @Res() res: Response) {
    const data = await this.authService.logout(user, res);

    return res.status(HttpStatus.OK).json({
      message: 'Logged out successfully',
      statusCode: HttpStatus.OK,
      data,
    });
  }
}
