import { PaymentEntity } from "./payment.entity";

export interface CreatePaymentInput {
    orderId: string;
    provider: "stripe" | "bkash";
    transactionId: string;
    status: "pending" | "success" | "failed";
    rawResponse?: unknown;
}

export interface IPaymentRepository {
    createPayment(input: CreatePaymentInput): Promise<PaymentEntity>;
    updatePaymentStatus(transactionId: string, status: "pending" | "success" | "failed", rawResponse?: unknown): Promise<PaymentEntity | null>;
    findByTransactionId(transactionId: string): Promise<PaymentEntity | null>;
    findByOrderId(orderId: string): Promise<PaymentEntity[]>;
}
