import { IProductRepository, UpdateProductInput } from "../domain/product.repository";
import { Result } from "@core/types/Result";

export interface UpdateProductDTO {
    id: string;
    data: UpdateProductInput;
}

export class UpdateProductUseCase {
    constructor(private readonly repo: IProductRepository) { }

    async execute(input: UpdateProductDTO): Promise<Result<boolean, Error>> {
        const updated = await this.repo.updateProduct(input.id, input.data);
        if (!updated) {
            return Result.fail(new Error("Failed to update product"));
        }
        return Result.ok(updated);
    }
}
