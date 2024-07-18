import { CreateUserInput } from './model/user.input';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(body: CreateUserInput): Promise<import("./model/user.payload").UserPayload>;
    listUser(): Promise<import("./model/user.payload").UserPayload[]>;
    findUser(id: string): Promise<import("./model/user.payload").UserPayload>;
    updateUser(id: string, body: CreateUserInput): Promise<import("./model/user.payload").UserPayload>;
    deleteUser(id: string): Promise<void>;
}
