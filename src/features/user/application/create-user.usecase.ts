import { CreateUserInput, IUserRepository } from "../domain/user.repository";
import { Result } from "@core/types/Result";
import { UserEntity } from "../domain/user.entity";


export class CreateUserUseCase {
    constructor(private readonly repo: IUserRepository) { }

    async execute(input: CreateUserInput): Promise<Result<UserEntity, Error>> {
        const duplicateEmail = await this.repo.findUserByEmail(input.email);
        if (duplicateEmail) {
            return Result.fail(new Error(`User with ${input.email} already exist!`));
        }
        const user = await this.repo.createUser(input);
        if (!user) {
            return Result.fail(new Error("Failed to create new user"))
        }
        return Result.ok(user)
    }
}
