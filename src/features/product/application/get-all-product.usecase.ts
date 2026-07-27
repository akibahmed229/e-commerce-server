import { IProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { Result } from "@core/types/Result";

export class GetAllProductUseCase {
    constructor(private readonly repo: IProductRepository) { }

    async execute(): Promise<Result<ProductEntity[], Error>> {
        const products = await this.repo.getAllProduct();
        if (!products) {
            return Result.fail(new Error("Failed to get products"));
        }
        return Result.ok(products);
    }
}
