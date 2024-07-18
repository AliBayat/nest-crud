import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { NotificationModule } from 'src/notification/notification.module';

@Injectable()
export class RabbitMQService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'notification',
      },
    });
  }

  async sendNotification(notification: NotificationModule) {
    return await this.client
      .emit('notification_queue', notification)
      .toPromise();
  }
}