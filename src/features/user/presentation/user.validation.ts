import { z } from "zod"

export const createUserSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(255),
    email: z.email("Invalid email address").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(72) // bcrypt's 72-byte limit
})

export const updateUserSchema = z.object({
    name: z.string().trim().min(2).max(255).optional(),
    email: z.email().max(255).optional(),
    password: z.string().min(8).max(72).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (name, email, password) must be provided",
})

export const loginUserSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const userIdParamSchema = z.object({
    id: z.uuid("Invalid user id"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
