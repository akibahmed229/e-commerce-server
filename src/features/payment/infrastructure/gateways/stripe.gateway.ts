import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export class StripeGateway {
    async createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
        const intent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata,
            automatic_payment_methods: { enabled: true, allow_redirects: "never" }, // card, no redirect flows
        })

        return { clientSecret: intent.client_secret!, paymentIntentId: intent.id }
    }

    async retrievePaymentIntent(paymentIntentId: string) {
        return stripe.paymentIntents.retrieve(paymentIntentId);
    }

    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
        return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    }
}
