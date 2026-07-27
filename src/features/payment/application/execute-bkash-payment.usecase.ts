import { IOrderRepository } from "@features/order/domain/order.repository";
import { IPaymentRepository } from "../domain/payment.repository";
import { BkashGateway } from "../infrastructure/gateways/bkash.gateway";
import { Result } from "@core/types/Result";

export class ExecuteBkashPaymentUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly orderRepo: IOrderRepository,
        private readonly bkashGateway: BkashGateway
    ) { }

    async execute(paymentID: string): Promise<Result<{ status: string }, Error>> {
        const result = await this.bkashGateway.executePayment(paymentID);
        const success = result.transactionStatus === "Completed" || result.statusCode === "0000";
        const status = success ? "success" : "failed";

        const payment = await this.paymentRepo.updatePaymentStatus(paymentID, status, result);
        if (!payment) return Result.fail(new Error("Payment record not found for this transaction"));

        if (success) await this.orderRepo.markOrderAsPaid(payment.orderId);

        return Result.ok({ status })
    }
}
