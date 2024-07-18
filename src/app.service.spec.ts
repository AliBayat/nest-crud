import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('AppService', () => {
  let appService: AppService;
  let clientProxyMock: ClientProxy;

  beforeEach(async () => {
    const clientProxyMockProvider = {
      provide: 'RABBITMQ_SERVICE',
      useValue: {
        connect: jest.fn(),
        close: jest.fn(),
        send: jest.fn().mockReturnValue(of({})),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, clientProxyMockProvider],
    }).compile();

    appService = module.get<AppService>(AppService);
    clientProxyMock = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  it('should call connect on onModuleInit', async () => {
    await appService.onModuleInit();
    expect(clientProxyMock.connect).toHaveBeenCalled();
  });

  it('should call close on onModuleDestroy', async () => {
    await appService.onModuleDestroy();
    expect(clientProxyMock.close).toHaveBeenCalled();
  });

  it('should send message', async () => {
    const pattern = 'test_pattern';
    const data = { key: 'value' };
    await appService.sendMessage(pattern, data);
    expect(clientProxyMock.send).toHaveBeenCalledWith(pattern, data);
  });
});
