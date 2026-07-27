import { pgTable, uuid, varchar, text, integer, numeric } from "drizzle-orm/pg-core";
import { productStatusEnum } from "@core/database/schema/enums";
import { timestamps } from "@core/database/schema/helpers";
import { index } from "drizzle-orm/cockroach-core";
import { categoriesTable } from "@core/database/schema";

export const productsTable = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
    status: productStatusEnum("status").notNull().default("active"),
    categoryId: uuid("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
    ...timestamps,
},
    (table) => [
        index("idx_products_category_id").on(table.categoryId),
        index("idx_products_status").on(table.status),
    ]);

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
