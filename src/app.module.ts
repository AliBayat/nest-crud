import { Module } from '@nestjs/common';
import { NotificationsService } from './notification/notification.service';
import { NotificationsController } from './notification/notification.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { ClientsModule } from '@nestjs/microservices';
import { rabbitMQConfig } from './config/rabbitmq.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { NotificationModule } from './notification/notification.module';
import { UserService } from './user/user.service';
import { User, UserSchema } from './user/model/user.schema';
import { Avatar, AvatarSchema } from './user/model/avatar.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Avatar.name, schema: AvatarSchema }]),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
      auth: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
      },
    }),
    ClientsModule.register(rabbitMQConfig),
    UserModule,
    NotificationModule,
  ],
  controllers: [NotificationsController],
  providers: [AppService, RabbitMQService, UserService, NotificationsService],
})
export class AppModule {}
