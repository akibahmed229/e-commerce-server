import { IUserRepository } from "../domain/user.repository";
import { Result } from "@core/types/Result";
import { UserEntity } from "../domain/user.entity";


export class GetAllUserUseCase {
    constructor(private readonly repo: IUserRepository) { }

    async execute(): Promise<Result<UserEntity[], Error>> {
        const users = await this.repo.getAllUser();
        if (!users) {
            return Result.fail(new Error("Failed to get all user"))
        }
        return Result.ok(users)
    }
}
