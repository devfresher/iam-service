import { Request } from 'express';
import { Auth } from '../../modules/auth/entities/auth.entity';

export interface AuthenticatedRequest extends Request {
  user: Auth;
}
