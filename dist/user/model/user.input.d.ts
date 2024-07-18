export declare class CreateUserInput {
    fullName: string;
    email: string;
    bio: string;
    password: string;
}
declare const UpdateUserInput_base: import("@nestjs/common").Type<Omit<CreateUserInput, "password">>;
export declare class UpdateUserInput extends UpdateUserInput_base {
}
export {};
