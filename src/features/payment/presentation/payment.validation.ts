import { z } from "zod";

export const createStripeIntentSchema = z.object({
    orderId: z.uuid("Invalid order id"),
});

export const initiateBkashSchema = z.object({
    orderId: z.uuid("Invalid order id"),
});
