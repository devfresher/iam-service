import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { AuthService } from './auth.service';
import { ActiveUser } from './types/active-user';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

describe('ProfileController', () => {
  let controller: ProfileController;
  let authService: AuthService;

  const mockAuthService = {
    logout: jest.fn(),
  };

  const mockUser: ActiveUser = {
    id: '1',
    email: 'user@example.com',
    roles: [Role.Patient],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /profile', () => {
    it('should return the active user profile', async () => {
      const result = await controller.activeUserProfile(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('POST /profile/logout', () => {
    it('should call authService.logout and return correct response', async () => {
      const mockResponse = {
        clearCookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const logoutData = { success: true };
      mockAuthService.logout.mockResolvedValue(logoutData);

      await controller.logout(mockUser, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith(mockUser, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
        statusCode: HttpStatus.OK,
        data: logoutData,
      });
    });
  });
});
