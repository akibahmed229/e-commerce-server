import { errorHandler } from "@core/middlewares/error-handler";
import { logger } from "@core/middlewares/log-events";
import { productRoutes } from "@features/product/presentation/product.routes";
import { userRoutes } from "@features/user/presentation/user.routes";
import express, { type Express } from "express"
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



app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.use(errorHandler);

