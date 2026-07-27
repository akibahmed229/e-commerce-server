import { pgTable, uuid, varchar, index } from "drizzle-orm/pg-core";
import { timestamps } from "@core/database/schema/helpers";

export const categoriesTable = pgTable(
    "categories",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }).notNull().unique(),
        // self-referencing FK — null means "top-level category"
        parentId: uuid("parent_id").references((): any => categoriesTable.id, { onDelete: "set null" }),
        ...timestamps,
    },
    (table) => [
        index("idx_categories_parent_id").on(table.parentId), // every DFS traversal starts here
    ]
);

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
