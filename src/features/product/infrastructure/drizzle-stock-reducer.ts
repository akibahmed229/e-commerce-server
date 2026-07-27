import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql, eq, and, gte } from "drizzle-orm";
import { productsTable } from "./persistence/product.schema";
import { IStockReducer, StockReductionRequest, StockReductionResult } from "../domain/stock-reducer";

export class DrizzleStockReducer implements IStockReducer {
    constructor(private readonly db: NodePgDatabase) { }

    async reduce(requests: StockReductionRequest[]): Promise<StockReductionResult[]> {
        return this.db.transaction(async (tx) => {
            const results: StockReductionResult[] = [];

            for (const req of requests) {
                // single atomic statement: the WHERE clause's `gte(stock, quantity)` check
                // and the decrement happen together — Postgres locks the row for the
                // duration of this statement, so no concurrent transaction can read a
                // stale stock value between "check" and "write".
                const [updated] = await tx
                    .update(productsTable)
                    .set({ stock: sql`${productsTable.stock} - ${req.quantity}` })
                    .where(and(eq(productsTable.id, req.productId), gte(productsTable.stock, req.quantity)))
                    .returning({ stock: productsTable.stock });

                if (!updated) {
                    // either the product doesn't exist, or stock was insufficient at the moment
                    // of this exact statement — triggers a full transaction rollback below
                    throw new Error(`Unable to reduce stock for product ${req.productId} — insufficient stock or not found`);
                }

                results.push({ productId: req.productId, success: true, remainingStock: updated.stock });
            }

            return results;
        });
    }
}
