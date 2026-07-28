import { errorHandler } from "@core/middlewares/error-handler";
import { logger } from "@core/middlewares/log-events";
import { productRoutes } from "@features/product/presentation/product.routes";
import { userRoutes } from "@features/user/presentation/user.routes";
import express, { type Express, type Request, type Response } from "express"
import path from "path"
import cookieParser from "cookie-parser";
import cors from "cors";
import { orderRoutes } from "@features/order/presentation/order.routes";
import { paymentRoutes } from "@features/payment/presentation/payment.routes";
import { corsOptions } from "@core/config/corsOptions";
import { byPassExpressJson } from "@core/middlewares/bypass-express-json";

export const app: Express = express();

app.use(cookieParser());
app.use(logger);
app.use(cors(corsOptions));

// bypass json() for - stripe webhook
// handles its own raw() parsing internally via payment.routes.ts
app.use(byPassExpressJson);

//serve static files
app.use("/", express.static(path.join(__dirname, "../", "public")));

// get route for homepage match: /, /index, /index.html
app.get(/^\/$|^\/index(.html)?$/, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../", "views", "index.html"));
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);

// fallback for 404
app.use((req: Request, res: Response) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "../", "views", "404.html"));
    } else if (req.accepts("json")) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type("txt").send("404 Not Found");
    }
});

app.use(errorHandler);
