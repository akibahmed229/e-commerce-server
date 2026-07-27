import { Request, Response, NextFunction } from "express"; // Default import
import rateLimit, { Options } from "express-rate-limit";
import { logEvents } from "./log-events";

export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 login requests per "window" per minute
    message: {
        message:
            "Too many request from this IP, please try again after a 60 second pause",
    },
    handler: (
        req: Request,
        res: Response,
        next: NextFunction,
        options: Options,
    ) => {
        logEvents(
            `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
            "errLog.log",
        );
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // disable the `X-RateLimit-*` headers
});
