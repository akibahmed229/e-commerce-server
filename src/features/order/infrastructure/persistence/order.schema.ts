import { pgTable, uuid, integer, numeric } from "drizzle-orm/pg-core";
import { orderStatusEnum } from "@core/database/schema/enums";
import { timestamps } from "@core/database/schema/helpers";
import { productsTable, usersTable } from "@core/database/schema";
import { index } from "drizzle-orm/cockroach-core";

export const ordersTable = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    ...timestamps,
},
    (table) => [
        index("idx_orders_user_id").on(table.userId),   // "my orders" query
        index("idx_orders_status").on(table.status),      // admin filtering by status
    ]
);

export const orderItemsTable = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => productsTable.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
},
    (table) => [
        index("idx_order_items_order_id").on(table.orderId),
        index("idx_order_items_product_id").on(table.productId),
    ]
);

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;
