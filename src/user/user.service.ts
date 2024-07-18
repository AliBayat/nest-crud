import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './model/user.schema';
import { Model } from 'mongoose';
import { CreateUserInput, UpdateUserInput } from './model/user.input';
import { UserPayload } from './model/user.payload';
import { Avatar } from './model/avatar.schema';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Avatar.name) private avatarModel: Model<Avatar>,
  ) {}

  async createUser(body: CreateUserInput): Promise<void> {
    const query = { email: body.email };
    const options = { lean: true };
    const existingEmail = await this.userModel.findOne(query, null, options);
    if (existingEmail) {
      throw new ConflictException('Email is already taken');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const createdUser = new this.userModel({
      fullName: body.fullName,
      email: body.email,
      bio: body.bio,
      password: hashedPassword,
    });

    await createdUser.save();
  }

  async getUserAvatar(
    userId: string,
  ): Promise<{ avatar: string; source: string }> {
    const query = { userId };
    const options = { lean: true };
    const avatar = await this.avatarModel.findOne(query, null, options);

    if (avatar) {
      return {
        avatar: avatar.base64 as string,
        source: 'database',
      };
    }

    const user = await this.findUser(userId);
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    const avatarUrl = response.data.data.avatar;

    const imageResponse = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');
    const base64 = imageBuffer.toString('base64');

    const hash = crypto.createHash('sha256').update(base64).digest('hex');

    const newAvatar = new this.avatarModel({ userId, hash, base64 });
    await newAvatar.save();
    try {
      const filename = `avatar_${userId}.jpg`;

      const directory = path.join(__dirname, '../avatar_storage');
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      const filepath = path.join(directory, filename);
      fs.writeFileSync(filepath, base64, 'base64');
    } catch (error) {
      console.error(`Error fetching or saving avatar: ${error.message}`);
      throw new Error('Failed to fetch or save avatar.');
    }

    return {
      avatar: base64,
      source: 'online',
    };
  }

  async findUser(id: string): Promise<string | null> {
    try {
      const query = { id };
      const options = { lean: true };
      const user = await this.avatarModel.findOne(query, null, options);

      if (!user) {
        return null;
      }

      return id;
    } catch (error) {
      console.error(`Error finding user: ${error}`);
    }
  }

  async updateUser(id: string, body: UpdateUserInput): Promise<UserPayload> {
    await this.userModel.updateOne({ _id: id }, body);
    const updatedUser = this.userModel.findById(id);
    return updatedUser;
  }

  async deleteUserAvatar(id: string): Promise<void> {
    const filename = `avatar_${id}.jpg`;
    const directory = path.join(__dirname, '../avatar_storage');
    const filepath = path.join(directory, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await this.avatarModel.deleteOne({ userId: id });
  }
}
