import { IProductRepository } from "../domain/product.repository";
import { Result } from "@core/types/Result";

export interface DeleteProductDTO {
    id: string;
}

export class DeleteProductUseCase {
    constructor(private readonly repo: IProductRepository) { }

    async execute(input: DeleteProductDTO): Promise<Result<boolean, Error>> {
        const deleted = await this.repo.deleteProduct(input.id);
        if (!deleted) {
            return Result.fail(new Error("Failed to delete product"));
        }
        return Result.ok(deleted);
    }
}
