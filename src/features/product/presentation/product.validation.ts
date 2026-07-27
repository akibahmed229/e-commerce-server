import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(255),
    sku: z.string().trim().min(1, "SKU is required").max(100).toUpperCase(),
    description: z.string().trim().max(2000).optional(),
    price: z.coerce.number().positive("Price must be greater than 0")
        .transform((val) => val.toFixed(2)), // -> numeric-safe string for the DB
    stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
    status: z.enum(["active", "inactive"]).optional(),
});

export const updateProductSchema = z.object({
    name: z.string().trim().min(2).max(255).optional(),
    sku: z.string().trim().min(1).max(100).toUpperCase().optional(),
    description: z.string().trim().max(2000).optional(),
    price: z.coerce.number().positive().transform((val) => val.toFixed(2)).optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    status: z.enum(["active", "inactive"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});

export const productIdParamSchema = z.object({
    id: z.uuid("Invalid product id"),
});

export type CreateProductInputDTO = z.infer<typeof createProductSchema>;
export type UpdateProductInputDTO = z.infer<typeof updateProductSchema>;
