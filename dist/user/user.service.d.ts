import { User } from './model/user.schema';
import { Model } from 'mongoose';
import { CreateUserInput, UpdateUserInput } from './model/user.input';
import { UserPayload } from './model/user.payload';
export declare class UserService {
    private userModel;
    constructor(userModel: Model<User>);
    createUser(body: CreateUserInput): Promise<UserPayload>;
    findUser(id: string): Promise<UserPayload>;
    listUser(): Promise<UserPayload[]>;
    updateUser(id: string, body: UpdateUserInput): Promise<UserPayload>;
    deleteUser(id: string): Promise<void>;
}
