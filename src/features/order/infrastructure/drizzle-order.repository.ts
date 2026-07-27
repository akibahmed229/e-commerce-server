import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, inArray } from "drizzle-orm";
import { IOrderRepository, CreateOrderInput } from "../domain/order.repository";
import { OrderEntity } from "../domain/order.entity";
import { ordersTable, orderItemsTable } from "./persistence/order.schema";
import { productsTable } from "@features/product/infrastructure/persistence/product.schema";

export class DrizzleOrderRepository implements IOrderRepository {
    constructor(private readonly db: NodePgDatabase) { }

    async createOrder(input: CreateOrderInput): Promise<OrderEntity> {
        return this.db.transaction(async (tx) => {
            const productIds = input.items.map((item) => item.productId);
            const products = await tx.select().from(productsTable).where(inArray(productsTable.id, productIds));

            if (products.length !== productIds.length) {
                throw new Error("One or more products do not exist");
            }

            const productMap = new Map(products.map((p) => [p.id, p]));

            for (const item of input.items) {
                const product = productMap.get(item.productId)!;
                if (product.status !== "active") {
                    throw new Error(`Product "${product.name}" is not available`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for "${product.name}" (available: ${product.stock})`);
                }
            }

            let totalAmount = 0;
            const orderItemsData = input.items.map((item) => {
                const product = productMap.get(item.productId)!;
                const price = parseFloat(product.price);
                const subtotal = price * item.quantity;
                totalAmount += subtotal;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: price.toFixed(2),
                    subtotal: subtotal.toFixed(2),
                };
            });

            const [order] = await tx
                .insert(ordersTable)
                .values({ userId: input.userId, totalAmount: totalAmount.toFixed(2), status: "pending" })
                .returning();

            const items = await tx
                .insert(orderItemsTable)
                .values(orderItemsData.map((item) => ({ ...item, orderId: order.id })))
                .returning();

            return { ...order, items };
        });
    }

    async getOrderById(id: string): Promise<OrderEntity | null> {
        const [order] = await this.db.select().from(ordersTable).where(eq(ordersTable.id, id));
        if (!order) return null;

        const items = await this.db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
        return { ...order, items };
    }

    async getOrdersByUserId(userId: string): Promise<OrderEntity[]> {
        const orders = await this.db.select().from(ordersTable).where(eq(ordersTable.userId, userId));

        const orderIds = orders.map((o) => o.id);
        if (orderIds.length === 0) return [];

        const allItems = await this.db.select().from(orderItemsTable).where(inArray(orderItemsTable.orderId, orderIds));
        const itemsByOrder = new Map<string, typeof allItems>();
        for (const item of allItems) {
            const list = itemsByOrder.get(item.orderId) ?? [];
            list.push(item);
            itemsByOrder.set(item.orderId, list);
        }

        return orders.map((order) => ({ ...order, items: itemsByOrder.get(order.id) ?? [] }));
    }

    async updateOrderStatus(id: string, status: "pending" | "paid" | "canceled"): Promise<boolean> {
        const [updated] = await this.db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
        return !!updated;
    }

    async markOrderAsPaid(orderId: string): Promise<boolean> {
        return this.db.transaction(async (tx) => {
            const [order] = await tx.select().from(ordersTable).where(eq(ordersTable.id, orderId));
            if (!order) return false;
            if (order.status === "paid") return true; // idempotent — webhooks can fire more than once

            const items = await tx.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

            for (const item of items) {
                const [product] = await tx.select().from(productsTable).where(eq(productsTable.id, item.productId));
                if (!product || product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.productId} during payment completion`);
                }

                await tx.update(productsTable).set({ stock: product.stock - item.quantity }).where(eq(productsTable.id, item.productId));
            }

            await tx.update(ordersTable).set({ status: "paid" }).where(eq(ordersTable.id, orderId));

            return true;
        });
    }
}
