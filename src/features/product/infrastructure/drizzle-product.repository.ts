import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { ProductEntity } from "../domain/product.entity";
import { IProductRepository, CreateProductInput, UpdateProductInput } from "../domain/product.repository";
import { NewProduct, productsTable } from "./persistence/product.schema";

export class DrizzleProductRepository implements IProductRepository {
    constructor(private readonly db: NodePgDatabase) { }

    async createProduct(product: CreateProductInput): Promise<ProductEntity> {
        try {
            const newProductObj: NewProduct = { ...product };
            const [created] = await this.db.insert(productsTable).values(newProductObj).returning();
            return created;
        } catch (error) {
            console.error(error);
            throw new Error(`Internal Server Error: ${error}`);
        }
    }

    async getAllProduct(): Promise<ProductEntity[]> {
        try {
            return await this.db.select().from(productsTable);
        } catch (error) {
            console.error(error);
            throw new Error(`Internal Server Error: ${error}`);
        }
    }

    async updateProduct(id: string, product: UpdateProductInput): Promise<boolean> {
        try {
            const [updated] = await this.db
                .update(productsTable)
                .set(product)
                .where(eq(productsTable.id, id))
                .returning();
            return !!updated;
        } catch (error) {
            console.error(error);
            throw new Error(`Internal Server Error: ${error}`);
        }
    }

    async deleteProduct(id: string): Promise<boolean> {
        try {
            const [deleted] = await this.db.delete(productsTable).where(eq(productsTable.id, id)).returning();
            return !!deleted;
        } catch (error) {
            console.error(error);
            throw new Error(`Internal Server Error: ${error}`);
        }
    }

    async findProductBySku(sku: string): Promise<ProductEntity> {
        try {
            const [updated] = await this.db
                .select()
                .from(productsTable)
                .where(eq(productsTable.sku, sku));
            return updated;
        } catch (error) {
            console.error(error);
            throw new Error(`Internal Server Error: ${error}`);
        }
    }
}
