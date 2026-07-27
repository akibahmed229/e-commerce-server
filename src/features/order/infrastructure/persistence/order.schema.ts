import { pgTable, uuid, integer, numeric } from "drizzle-orm/pg-core";
import { orderStatusEnum } from "@core/database/schema/enums";
import { timestamps } from "@core/database/schema/helpers";
import { productsTable, usersTable } from "@core/database/schema";

export const ordersTable = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    ...timestamps,
});

export const orderItemsTable = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => productsTable.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;
