import { IOrderRepository } from "@features/order/domain/order.repository";
import { IPaymentRepository } from "../domain/payment.repository";
import { BkashGateway } from "../infrastructure/gateways/bkash.gateway";
import { Result } from "@core/types/Result";

export interface InitiateBkashPaymentDTO {
    orderId: string;
    userId: string;
}

export class InitiateBkashPaymentUseCase {
    constructor(
        private readonly orderRepo: IOrderRepository,
        private readonly paymentRepo: IPaymentRepository,
        private readonly bkashGateway: BkashGateway
    ) { }

    async execute(input: InitiateBkashPaymentDTO): Promise<Result<{ bkashURL: string }, Error>> {
        const order = await this.orderRepo.getOrderById(input.orderId);
        if (!order) return Result.fail(new Error("Order not found"));
        if (order.userId !== input.userId) return Result.fail(new Error("You do not own this order"));
        if (order.status !== "pending") return Result.fail(new Error(`Order is already ${order.status}`));

        const callbackURL = `${process.env.API_BASE_URL}/api/v1/payments/bkash/callback`;
        const response = await this.bkashGateway.createPayment(parseFloat(order.totalAmount), order.id, callbackURL);

        if (!response.paymentID || !response.bkashURL) {
            return Result.fail(new Error(response.statusMessage ?? "Failed to initiate bKash payment"));
        }

        await this.paymentRepo.createPayment({
            orderId: order.id,
            provider: "bkash",
            transactionId: response.paymentID,
            status: "pending",
            rawResponse: response
        })

        return Result.ok({ bkashURL: response.bkashURL })
    }
}
