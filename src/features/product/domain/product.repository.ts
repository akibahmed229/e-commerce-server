import { ProductEntity } from "./product.entity";

export interface CreateProductInput {
    name: string;
    sku: string;
    description?: string;
    price: string;
    stock: number;
    status?: "active" | "inactive";
}

export interface UpdateProductInput {
    name?: string;
    sku?: string;
    description?: string;
    price?: string;
    stock?: number;
    status?: "active" | "inactive";
}

export interface IProductRepository {
    createProduct(product: CreateProductInput): Promise<ProductEntity>;
    getAllProduct(): Promise<ProductEntity[]>;
    updateProduct(id: string, product: UpdateProductInput): Promise<boolean>;
    deleteProduct(id: string): Promise<boolean>;
    findProductBySku(sku: string): Promise<ProductEntity>;
}
