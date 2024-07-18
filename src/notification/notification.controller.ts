import { Controller, Post, Body, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationsService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  private logger = new Logger('NotificationsController');

  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async sendNotification(@Body() notification: any) {
    this.notificationsService.sendNotification(notification);
    return { status: 'Notification sent' };
  }

  @EventPattern('notification')
  handleNotification(data: Record<string, unknown>) {
    this.logger.log('Received notification:', data);
    // Process the notification here
  }
}
