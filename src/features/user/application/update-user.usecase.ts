import { IUserRepository, UpdateUserInput } from "../domain/user.repository";
import { Result } from "@core/types/Result";

export interface UpdateUserDTO {
    id: string;
    data: UpdateUserInput;
}


export class UpdateUserUseCase {
    constructor(private readonly repo: IUserRepository) { }

    async execute(input: UpdateUserDTO): Promise<Result<boolean, Error>> {
        const user = await this.repo.updateUser(input.id, input.data);

        if (!user) {
            return Result.fail(new Error("Failed to update new user"))
        }

        return Result.ok(user)
    }
}

