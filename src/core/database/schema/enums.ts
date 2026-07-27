import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const productStatusEnum = pgEnum("product_status", ["active", "inactive"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "canceled"]);
export const paymentProviderEnum = pgEnum("payment_provider", ["stripe", "bkash"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "success", "failed"]);
