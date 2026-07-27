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

export const app: Express = express();

app.use(cookieParser());
app.use(logger);
app.use(cors(corsOptions));

// bypass express.json() specifically for the Stripe webhook path — it needs raw bytes
app.use((req, res, next) => {
    if (req.originalUrl === "/api/v1/payments/stripe/webhook") {
        next();
    } else {
        express.json()(req, res, next);
    }
});


// mount payment routes FIRST, before any global json() — its webhook route
// handles its own raw() parsing internally via payment.routes.ts
app.use("/api/v1/payments", paymentRoutes);

// json() applied only from here on, so it never touches /payments/stripe/webhook
app.use(express.json());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);

app.use(errorHandler);

