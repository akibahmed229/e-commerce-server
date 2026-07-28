import express, { type NextFunction, type Request, type Response } from "express";

// bypass express.json() specifically for the Stripe webhook path — it needs raw bytes
export const byPassExpressJson = (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl === "/api/v1/payments/stripe/webhook") {
        next();
    } else {
        express.json()(req, res, next);
    }
}


