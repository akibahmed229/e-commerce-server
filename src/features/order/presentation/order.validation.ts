import { z } from "zod";

export const createOrderSchema = z.object({
    items: z.array(
        z.object({
            productId: z.uuid("Invalid product id"),
            quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
        })
    ).min(1, "Order must contain at least one item"),
});

export const orderIdParamSchema = z.object({
    id: z.uuid("Invalid order id"),
});

export type CreateOrderInputDTO = z.infer<typeof createOrderSchema>;
