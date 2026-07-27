import { type Request, type Response } from "express";
import Stripe from "stripe";
import { CreateStripePaymentIntentUseCase } from "../application/create-stripe-payment-intent.usecase";
import { HandleStripeWebhookUseCase } from "../application/handle-stripe-webhook.usecase";
import { InitiateBkashPaymentUseCase } from "../application/initiate-bkash-payment.usecase";
import { ExecuteBkashPaymentUseCase } from "../application/execute-bkash-payment.usecase";
import { QueryBkashPaymentUseCase } from "../application/query-bkash-payment.usecase";
import { StripeGateway } from "../infrastructure/gateways/stripe.gateway";

export class PaymentController {
    constructor(
        private readonly createStripeIntent: CreateStripePaymentIntentUseCase,
        private readonly handleStripeWebhook: HandleStripeWebhookUseCase,
        private readonly stripeGateway: StripeGateway,
        private readonly initiateBkash: InitiateBkashPaymentUseCase,
        private readonly executeBkash: ExecuteBkashPaymentUseCase,
        private readonly queryBkash: QueryBkashPaymentUseCase
    ) { }

    handleCreateStripeIntent = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.createStripeIntent.execute({ orderId: req.body.orderId, userId: req.user!.id });
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json(result.value);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    // NOTE: req.body here is a raw Buffer, not parsed JSON — see routes file + app.ts for why
    handleStripeWebhookEvent = async (req: Request, res: Response): Promise<void> => {
        const signature = req.headers["stripe-signature"] as string;
        let event: Stripe.Event;
        try {
            event = this.stripeGateway.constructWebhookEvent(req.body, signature);
        } catch (error: any) {
            res.status(400).json({ error: `Webhook signature verification failed: ${error.message}` });
            return;
        }

        try {
            await this.handleStripeWebhook.execute(event);
            res.status(200).json({ received: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleInitiateBkash = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.initiateBkash.execute({ orderId: req.body.orderId, userId: req.user!.id });
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json(result.value);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleBkashCallback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { paymentID, status } = req.query as { paymentID: string; status: string };

            if (status !== "success") {
                res.redirect(`${process.env.FRONTEND_URL}/payment/failed?paymentID=${paymentID}`);
                return;
            }

            const result = await this.executeBkash.execute(paymentID);
            const outcome = result.ok ? result.value.status : "failed";
            res.redirect(`${process.env.FRONTEND_URL}/payment/${outcome}?paymentID=${paymentID}`);
        } catch {
            res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
        }
    };

    handleQueryBkash = async (req: Request, res: Response): Promise<void> => {
        try {
            const { paymentID } = req.params;
            const result = await this.queryBkash.execute(paymentID as string);
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json(result.value);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}
