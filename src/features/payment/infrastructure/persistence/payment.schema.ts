import { pgTable, uuid, varchar, jsonb } from "drizzle-orm/pg-core";
import { paymentProviderEnum, paymentStatusEnum } from "@core/database/schema/enums";
import { timestamps } from "@core/database/schema/helpers";
import { ordersTable } from "@core/database/schema";

export const paymentsTable = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "restrict" }),
    provider: paymentProviderEnum("provider").notNull(),
    transactionId: varchar("transaction_id", { length: 255 }).notNull().unique(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    rawResponse: jsonb("raw_response"),
    ...timestamps,
});

export type Payment = typeof paymentsTable.$inferSelect;
export type NewPayment = typeof paymentsTable.$inferInsert;
