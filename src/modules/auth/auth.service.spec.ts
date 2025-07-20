import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { SignupDto } from './dto/sign-up.dto';
import { ActiveUser } from './types/active-user';
import { Role } from '../../common/enums/role.enum';
import jwtRefreshConfig from '../../common/config/jwt-refresh.config';
import appConfig from '../../common/config/app.config';

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockConfig = {
  secret: 'refresh-secret',
  expiresIn: '7d',
  expiresInDays: 7,
};

const mockAppConfig = {
  nodeEnv: 'test',
};

function createMockUser(overrides: Partial<Auth> = {}): Auth {
  return {
    id: '1',
    email: 'test@example.com',
    username: 'user1',
    roles: [Role.Patient],
    password: 'hashed-password',
    status: true,
    refreshToken: 'refresh-token',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let authRepo: jest.Mocked<Repository<Auth>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: appConfig.KEY, useValue: mockAppConfig },
        { provide: jwtRefreshConfig.KEY, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepo = module.get(getRepositoryToken(Auth));
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should throw ConflictException if email or username exists', async () => {
      authRepo.findOne.mockResolvedValueOnce({} as Auth);
      await expect(
        service.signup({
          email: 'test@mail.com',
          username: 'user1',
          password: '1234',
        } as SignupDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password, save user and emit event', async () => {
      authRepo.findOne.mockResolvedValueOnce(null);
      authRepo.findOne.mockResolvedValueOnce(null);
      authRepo.save.mockResolvedValue(createMockUser({ id: '1' }));

      const result = await service.signup({
        email: 'test@mail.com',
        username: 'user1',
        password: '1234',
      } as SignupDto);

      expect(authRepo.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.signedUp',
        expect.any(Object),
      );
      expect(result.accessToken).toEqual('signed-token');
    });
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      authRepo.findOne.mockResolvedValue(null);
      const result = await service.validateUser('email', 'pass');
      expect(result).toBeNull();
    });

    it('should throw ForbiddenException if user is inactive', async () => {
      authRepo.findOne.mockResolvedValue({ status: false } as Auth);
      await expect(service.validateUser('email', 'pass')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return user if credentials are valid', async () => {
      const user = {
        status: true,
        password: await bcrypt.hash('1234', 10),
      } as Auth;
      authRepo.findOne.mockResolvedValue(user);
      const result = await service.validateUser('email', '1234');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should return tokens and emit event', async () => {
      const user = {
        id: '1',
        username: 'user',
        email: 'email',
        roles: ['admin'],
      } as Auth;
      const result = await service.login(user);
      expect(result.accessToken).toEqual('signed-token');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.loggedIn', user);
    });
  });

  describe('validateRefreshToken', () => {
    it('should return user if token is valid', async () => {
      const token = await bcrypt.hash('valid-token', 10);
      authRepo.findOne.mockResolvedValue({ refreshToken: token } as Auth);
      const result = await service.validateRefreshToken('1', 'valid-token');
      expect(result).toBeTruthy();
    });

    it('should return false if token is invalid', async () => {
      authRepo.findOne.mockResolvedValue({
        refreshToken: await bcrypt.hash('x', 10),
      } as Auth);
      const result = await service.validateRefreshToken('1', 'invalid-token');
      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should revoke token and clear cookie', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
      } as ActiveUser;
      const res = { clearCookie: jest.fn() } as any;
      authRepo.findOne.mockResolvedValue({ id: '1' } as Auth);
      authRepo.save.mockResolvedValue(createMockUser({ id: '1' }));

      const result = await service.logout(user, res);
      expect(res.clearCookie).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
