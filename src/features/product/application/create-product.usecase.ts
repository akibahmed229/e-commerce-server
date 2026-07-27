import { IProductRepository, CreateProductInput } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { Result } from "@core/types/Result";

export class CreateProductUseCase {
    constructor(private readonly repo: IProductRepository) { }

    async execute(input: CreateProductInput): Promise<Result<ProductEntity, Error>> {
        const duplicateProduct = await this.repo.findProductBySku(input.sku);
        if (duplicateProduct) {
            return Result.fail(new Error(`Product with ${input.sku} already exist!`));
        }
        const product = await this.repo.createProduct(input);
        if (!product) {
            return Result.fail(new Error("Failed to create product"));
        }
        return Result.ok(product);
    }
}
