import { Response, Request, NextFunction } from "express";
import fs from "fs"
import fsPromises from "fs/promises"
import path from "path"
import { format } from "date-fns";
import { v7 as uuidv7 } from 'uuid';

export const logEvents = async (message: string, logName: string) => {
    const dateTime = `${format(new Date(), "yyyy-MM-dd\thh:mm:ss a")}`;
    const logItem = `${dateTime}\t${uuidv7()}\t${message}\n`;

    try {
        // check if the dir exit if not then create
        if (!fs.existsSync(path.join(__dirname, "../../../", "logs"))) {
            await fsPromises.mkdir(path.join(__dirname, "../../../", "logs"));
        }

        // then append the log file
        await fsPromises.appendFile(path.join(__dirname, "../../../", "logs", logName), logItem)
    } catch (error) {
        console.log(`Log Events Error: ${error}`)
    }
}

export const logger = (req: Request, res: Response, next: NextFunction) => {
    logEvents(`${req.method} \t${req.headers.origin} \t${req.url} `, "reqLogs.txt");

    console.log(`${req.method} ${req.path} `);

    next();
}
