import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { NotificationsService } from './notification.service';
import { rabbitMQConfig } from '../config/rabbitmq.config';

@Module({
  imports: [ClientsModule.register(rabbitMQConfig)],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationModule {}
