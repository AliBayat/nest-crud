import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './model/user.schema';
import { NotificationModule } from '../notification/notification.module';
import { HttpModule } from '@nestjs/axios';
import { Avatar, AvatarSchema } from './model/avatar.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Avatar.name, schema: AvatarSchema }]),
    NotificationModule,
    HttpModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
