import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { HttpStatus } from '@nestjs/common';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { ActiveUser } from './types/active-user';
import { Response } from 'express';

// Mocks
const mockAuthService = {
  signup: jest.fn(),
  login: jest.fn(),
  refreshTokens: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should call authService.signup and return its result', async () => {
      const dto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const expectedResult = { id: 1, ...dto };
      mockAuthService.signup.mockResolvedValue(expectedResult);

      const result = await controller.signup(dto);

      expect(service.signup).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login and respond with a token', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
      } as ActiveUser;
      const req = { user } as AuthenticatedRequest;
      const res = mockResponse();

      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(loginResult);

      await controller.login(req, res);

      expect(service.login).toHaveBeenCalledWith(user, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged in successfully',
        statusCode: HttpStatus.OK,
        data: loginResult,
      });
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens and return new tokens', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
      } as ActiveUser;
      const res = mockResponse();

      const tokens = {
        accessToken: 'new-access-token',
      };

      mockAuthService.refreshTokens.mockResolvedValue(tokens);

      await controller.refreshTokens(user, res);

      expect(service.refreshTokens).toHaveBeenCalledWith(user, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token refreshed successfully',
        statusCode: HttpStatus.OK,
        data: tokens,
      });
    });
  });
});
