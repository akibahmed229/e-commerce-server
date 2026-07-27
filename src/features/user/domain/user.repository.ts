import { UserEntity } from "./user.entity";

export interface CreateUserInput {
    name: string;
    email: string;
    passwordHash: string;
    role?: "user" | "admin";
}

export interface UpdateUserInput {
    name?: string;
    email?: string;
    passwordHash?: string;
    role?: "user" | "admin";
}

export interface IUserRepository {
    createUser(user: CreateUserInput): Promise<UserEntity>;
    getAllUser(): Promise<UserEntity[]>;
    updateUser(id: string, user: UpdateUserInput): Promise<boolean>;
    deleteUser(id: string): Promise<boolean>;
    findUserByEmail(email: string): Promise<UserEntity | null>;
}
