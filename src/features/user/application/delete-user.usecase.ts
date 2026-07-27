import { IUserRepository } from "../domain/user.repository";
import { Result } from "@core/types/Result";

export interface DeleteUserDTO {
    id: string;
}


export class DeleteUserUseCase {
    constructor(private readonly repo: IUserRepository) { }

    async execute(input: DeleteUserDTO): Promise<Result<boolean, Error>> {
        const user = await this.repo.deleteUser(input.id);
        if (!user) {
            return Result.fail(new Error("Failed to delete new user"))
        }
        return Result.ok(user)
    }
}


