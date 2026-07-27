import { type Response, type Request, type NextFunction } from "express";
import { logEvents } from "./log-events";

interface customError extends Error {
    status?: number;
    code?: string;
}

export const errorHandler = (err: customError, req: Request, res: Response, next: NextFunction) => {
    logEvents(`${err.name}: ${err.message}`, "errLogs.txt");
    console.log(err.stack);

    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error"
    });
}
