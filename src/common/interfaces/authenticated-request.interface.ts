import { Request } from 'express';
import { Auth } from 'src/modules/auth/entities/auth.entity';

export interface AuthenticatedRequest extends Request {
  user: Auth;
}
