import Stripe from "stripe";
import { IOrderRepository } from "@features/order/domain/order.repository";
import { IPaymentRepository } from "../domain/payment.repository";
import { Result } from "@core/types/Result";

export class HandleStripeWebhookUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly orderRepo: IOrderRepository
    ) { }

    async execute(event: Stripe.Event): Promise<Result<void, Error>> {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const intent = event.data.object as Stripe.PaymentIntent;
                const payment = await this.paymentRepo.updatePaymentStatus(intent.id, "success", intent);
                if (payment) await this.orderRepo.markOrderAsPaid(payment.orderId);
                break;
            }
            case "payment_intent.payment_failed": {
                const intent = event.data.object as Stripe.PaymentIntent;
                await this.paymentRepo.updatePaymentStatus(intent.id, "failed", intent);
                break;
            }
            default:
                break;
        }

        return Result.ok(undefined);
    }
}
