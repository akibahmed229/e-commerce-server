import { IOrderRepository } from "@features/order/domain/order.repository";
import { IPaymentRepository } from "../domain/payment.repository";
import { StripeGateway } from "../infrastructure/gateways/stripe.gateway";
import { Result } from "@core/types/Result";

export interface CreateStripeIntentDTO {
    orderId: string;
    userId: string;
}

export class CreateStripePaymentIntentUseCase {
    constructor(
        private readonly orderRepo: IOrderRepository,
        private readonly paymentRepo: IPaymentRepository,
        private readonly stripeGateway: StripeGateway
    ) { }

    async execute(input: CreateStripeIntentDTO): Promise<Result<{ clientSecret: string; amountUsd: number; exchangeRate: number }, Error>> {
        const order = await this.orderRepo.getOrderById(input.orderId);
        if (!order) return Result.fail(new Error("Order not found"));
        if (order.userId !== input.userId) return Result.fail(new Error("You do not own this order"));
        if (order.status !== "pending") return Result.fail(new Error(`Order is already ${order.status}`));

        const { clientSecret, paymentIntentId, amountUsd, exchangeRate } = await this.stripeGateway.createPaymentIntent(
            parseFloat(order.totalAmount),
            order.id
        );

        await this.paymentRepo.createPayment({
            orderId: order.id,
            provider: "stripe",
            transactionId: paymentIntentId,
            status: "pending",
            rawResponse: { amountBdt: order.totalAmount, amountUsd, exchangeRate },
        });

        return Result.ok({ clientSecret, amountUsd, exchangeRate });
    }
}

