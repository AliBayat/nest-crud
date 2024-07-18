import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserInput } from './model/user.input';
import { UserService } from './user.service';
import { NotificationsService } from '../notification/notification.service';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  private logger = new Logger('NotificationsController');
  constructor(
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createUser(@Body() body: CreateUserInput) {
    await this.userService.createUser(body);
    const date = new Date();
    const notification = {
      message: 'user has been created',
      timestamp: date.toISOString(),
    };
    this.notificationsService.sendNotification(notification);
    return notification;
  }

  @Get(':id')
  getUser(@Param('id') id: string): Observable<any> {
    return this.httpService.get(`https://reqres.in/api/users/${id}`).pipe(
      map((response) => response.data),
      catchError((error) => {
        if (error.response && error.response.status === 404) {
          return throwError(
            () => new HttpException('User not found', HttpStatus.NOT_FOUND),
          );
        }
        return throwError(
          () =>
            new HttpException(
              'Internal server error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }

  @Get(':id/avatar')
  async getUserAvatar(@Param('id') id: string) {
    try {
      const userAv = await this.userService.getUserAvatar(id);
      return {
        user_id: id,
        source: userAv.source,
        avatar: userAv.avatar,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/:id/avatar')
  @HttpCode(204)
  async deleteUserAvatar(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUserAvatar(id);
  }
}
