import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ActiveUser } from '../../modules/auth/types/active-user';

export const AuthenticatedUser = createParamDecorator(
  (_, context: ExecutionContext): ActiveUser | undefined => {
    const request: Request = context.switchToHttp().getRequest();
    return request.user as ActiveUser;
  },
);
