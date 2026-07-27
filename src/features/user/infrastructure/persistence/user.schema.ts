import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { userRoleEnum } from "@core/database/schema/enums";
import { timestamps } from "@core/database/schema/helpers";
import { index } from "drizzle-orm/cockroach-core";

export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    ...timestamps,
}, (table) => [
    index("idx_users_email").on(table.email),
]
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
