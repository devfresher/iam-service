import { registerAs } from '@nestjs/config';

export default registerAs('jwt-refresh', () => ({
  secret: process.env.REFRESH_JWT_SECRET,
  expiresIn: process.env.REFRESH_JWT_EXPIRES,
  expiresInDays: parseInt(process.env.REFRESH_JWT_EXPIRES_DAYS || '30', 10),
}));
