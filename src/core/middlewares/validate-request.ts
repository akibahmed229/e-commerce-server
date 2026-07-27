import { type Request, type Response, type NextFunction } from "express";
import { ZodError, ZodType } from "zod";

type RequestPart = "body" | "params" | "query";

export const validateRequest = (schema: ZodType, part: RequestPart = "body") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[part]);

        if (!result.success) {
            const errors = (result.error as ZodError).issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            res.status(400).json({ error: "Validation Failed", details: errors });
            return;
        }

        // overwrite with parsed data so downstream code gets typed, coerced, defaulted values
        req[part] = result.data;
        next();
    }
}
