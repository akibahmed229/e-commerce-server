import bcrypt from "bcryptjs";
import { IUserRepository } from "../domain/user.repository";
import { UserEntity } from "../domain/user.entity";
import { Result } from "@core/types/Result";

export interface LoginUserDTO {
    email: string;
    password: string;
}

export class LoginUserUseCase {
    constructor(private readonly repo: IUserRepository) { }

    async execute(input: LoginUserDTO): Promise<Result<UserEntity, Error>> {
        const user = await this.repo.findUserByEmail(input.email);
        if (!user) {
            return Result.fail(new Error("User with that email doesn't exist!"));
        }

        const isMatch = await bcrypt.compare(input.password, user.passwordHash);
        if (!isMatch) {
            return Result.fail(new Error("Invalid email or password"));
        }

        return Result.ok(user);
    }
}
