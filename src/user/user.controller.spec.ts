import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotificationsService } from '../notification/notification.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let notificationsService: NotificationsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getUserAvatar: jest.fn(),
            deleteUserAvatar: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user data with status 200', (done) => {
      const userId = '1';
      const userResponse = {
        data: {
          id: 1,
          email: 'george.bluth@reqres.in',
          first_name: 'George',
          last_name: 'Bluth',
          avatar: 'https://reqres.in/img/faces/1-image.jpg',
        },
        support: {
          url: 'https://reqres.in/#support-heading',
          text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
        },
      };

      const response: AxiosResponse<typeof userResponse> = {
        data: userResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(response));

      userController.getUser(userId).subscribe((data) => {
        expect(data).toEqual(userResponse);
        done();
      });
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete the user avatar and return status 204', async () => {
      const userId = '1';

      jest.spyOn(userService, 'deleteUserAvatar').mockResolvedValue();

      await userController.deleteUserAvatar(userId);

      expect(userService.deleteUserAvatar).toHaveBeenCalledWith(userId);
    });
  });

  describe('createUser', () => {
    it('should create a user and send a notification', async () => {
      const createUserInput = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'A short bio',
        password: 'password123',
      };

      const notification = {
        message: 'user has been created',
        timestamp: expect.any(String),
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(undefined);

      const sendNotificationSpy = jest.spyOn(
        notificationsService,
        'sendNotification',
      );

      await userController.createUser(createUserInput);

      // expect(result).toEqual(notification);

      expect(sendNotificationSpy).toHaveBeenCalledWith(notification);
    });
  });

  describe('getUserAvatar', () => {
    it('should return user avatar from database', async () => {
      const userId = '1';
      const userAvatar = {
        avatar: 'base64string',
        source: 'database',
      };

      jest.spyOn(userService, 'getUserAvatar').mockResolvedValue(userAvatar);

      const result = await userController.getUserAvatar(userId);

      expect(result).toEqual({
        user_id: userId,
        source: userAvatar.source,
        avatar: userAvatar.avatar,
      });

      expect(userService.getUserAvatar).toHaveBeenCalledWith(userId);
    });

    it('should return user avatar from online', async () => {
      const userId = '2';
      const userAvatar = {
        avatar: 'base64string',
        source: 'online',
      };

      jest.spyOn(userService, 'getUserAvatar').mockResolvedValue(userAvatar);

      const result = await userController.getUserAvatar(userId);

      expect(result).toEqual({
        user_id: userId,
        source: userAvatar.source,
        avatar: userAvatar.avatar,
      });

      expect(userService.getUserAvatar).toHaveBeenCalledWith(userId);
    });

    it('should throw HttpException with status 404 if user not found', async () => {
      const userId = '3';
      const errorResponse = {
        response: {
          status: 404,
        },
      };

      jest.spyOn(userService, 'getUserAvatar').mockRejectedValue(errorResponse);

      await expect(userController.getUserAvatar(userId)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

      expect(userService.getUserAvatar).toHaveBeenCalledWith(userId);
    });

    it('should throw HttpException with status 500 for internal server error', async () => {
      const userId = '4';
      const errorResponse = new Error('Internal server error');

      jest.spyOn(userService, 'getUserAvatar').mockRejectedValue(errorResponse);

      await expect(userController.getUserAvatar(userId)).rejects.toThrow(
        new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(userService.getUserAvatar).toHaveBeenCalledWith(userId);
    });
  });
});
