import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Error connecting to RabbitMQ', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.close();
    } catch (error) {
      console.error('Error closing RabbitMQ connection', error);
    }
  }

  sendMessage(pattern: string, data: any) {
    return this.client
      .send(pattern, data)
      .toPromise()
      .catch((error) => {
        console.error('Error sending message', error);
      });
  }
}
