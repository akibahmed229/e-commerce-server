import { verifyAccessToken } from "@core/services/token.service";
import { type Request, type Response, type NextFunction } from "express";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }

    const token = header.split(" ")[1];

    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.id, role: payload.role };
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
