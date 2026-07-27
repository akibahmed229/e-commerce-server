import { getBdtToUsdRate } from "@core/services/exchange-rate.service";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export class StripeGateway {
    async createPaymentIntent(amountBdt: number, orderId: string) {
        const rate = await getBdtToUsdRate();
        const amountUsd = amountBdt * rate;

        const intent = await stripe.paymentIntents.create({
            amount: Math.round(amountUsd * 100), // Stripe wants integer cents
            currency: "usd",
            metadata: {
                orderId,
                amountBdt: amountBdt.toFixed(2), // always keep the original BDT figure traceable
                exchangeRate: rate.toString(),
            },
            automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        });

        return { clientSecret: intent.client_secret!, paymentIntentId: intent.id, amountUsd, exchangeRate: rate };
    }

    async retrievePaymentIntent(paymentIntentId: string) {
        return stripe.paymentIntents.retrieve(paymentIntentId);
    }

    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
        return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    }
}
