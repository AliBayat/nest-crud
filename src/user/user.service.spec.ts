import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from './user.service';
import { User } from './model/user.schema';
import { Avatar } from './model/avatar.schema';
import { NotificationsService } from '../notification/notification.service';
import { HttpModule, HttpService } from "@nestjs/axios";

const mockUser = {
  _id: '1',
  fullName: 'Test User',
  email: 'test@example.com',
  bio: 'Test Bio',
  password: 'password123',
};

const mockAvatar = {
  userId: '1',
  hash: 'somehash',
  base64: 'base64string',
};

const mockAvatarModel = {
  findOne: jest.fn().mockResolvedValue(mockAvatar),
  create: jest.fn().mockResolvedValue(mockAvatar),
  deleteOne: jest.fn().mockResolvedValue(true),
};

const mockNotificationsService = {
  sendNotification: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let avatarModel: Model<Avatar>;
  let notificationsService: NotificationsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(Avatar.name),
          useValue: mockAvatarModel,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    avatarModel = module.get<Model<Avatar>>(getModelToken(Avatar.name));
    notificationsService = module.get<NotificationsService>(NotificationsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get user avatar from the database', async () => {
    const userId = '1';
    jest.spyOn(avatarModel, 'findOne').mockResolvedValueOnce(mockAvatar as any);
    const result = await service.getUserAvatar(userId);
    expect(result).toEqual({ avatar: mockAvatar.base64, source: 'database' });
  });
});
