import { User } from './user.schema';
declare const UserPayload_base: import("@nestjs/common").Type<Partial<User>>;
export declare class UserPayload extends UserPayload_base {
    createdA?: string;
    updateAt?: string;
}
export {};
