import { Router, raw } from "express";
import { PaymentController } from "./payment.controller";
import { CreateStripePaymentIntentUseCase } from "../application/create-stripe-payment-intent.usecase";
import { HandleStripeWebhookUseCase } from "../application/handle-stripe-webhook.usecase";
import { InitiateBkashPaymentUseCase } from "../application/initiate-bkash-payment.usecase";
import { ExecuteBkashPaymentUseCase } from "../application/execute-bkash-payment.usecase";
import { QueryBkashPaymentUseCase } from "../application/query-bkash-payment.usecase";
import { DrizzlePaymentRepository } from "../infrastructure/drizzle-payment.repository";
import { StripeGateway } from "../infrastructure/gateways/stripe.gateway";
import { BkashGateway } from "../infrastructure/gateways/bkash.gateway";
import { DrizzleOrderRepository } from "@features/order/infrastructure/drizzle-order.repository";
import { db } from "@core/database/drizzle-client";
import { authenticate } from "@core/middlewares/authenticate";
import { validateRequest } from "@core/middlewares/validate-request";
import { createStripeIntentSchema, initiateBkashSchema } from "./payment.validation";

const router = Router();

const paymentRepository = new DrizzlePaymentRepository(db);
const orderRepository = new DrizzleOrderRepository(db);
const stripeGateway = new StripeGateway();
const bkashGateway = new BkashGateway();

const createStripeIntentUseCase = new CreateStripePaymentIntentUseCase(orderRepository, paymentRepository, stripeGateway);
const handleStripeWebhookUseCase = new HandleStripeWebhookUseCase(paymentRepository, orderRepository);
const initiateBkashUseCase = new InitiateBkashPaymentUseCase(orderRepository, paymentRepository, bkashGateway);
const executeBkashUseCase = new ExecuteBkashPaymentUseCase(paymentRepository, orderRepository, bkashGateway);
const queryBkashUseCase = new QueryBkashPaymentUseCase(bkashGateway);

const paymentController = new PaymentController(
    createStripeIntentUseCase,
    handleStripeWebhookUseCase,
    stripeGateway,
    initiateBkashUseCase,
    executeBkashUseCase,
    queryBkashUseCase
);

// PUBLIC — hit by Stripe's/bKash's servers directly, not your logged-in user's JWT, raw body required
router.post("/stripe/webhook",
    raw({ type: "application/json" }),
    paymentController.handleStripeWebhookEvent
);
router.get("/bkash/callback",
    paymentController.handleBkashCallback
);

// AUTHENTICATED — user-initiated actions
router.post("/stripe/create-intent",
    authenticate,
    validateRequest(createStripeIntentSchema, "body"),
    paymentController.handleCreateStripeIntent
);
router.post("/bkash/initiate",
    authenticate,
    validateRequest(initiateBkashSchema, "body"),
    paymentController.handleInitiateBkash
);
router.get("/bkash/query/:paymentID",
    authenticate,
    paymentController.handleQueryBkash
);

export { router as paymentRoutes };
