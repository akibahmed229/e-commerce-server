export interface PaymentEntity {
    id: string;
    orderId: string;
    provider: "stripe" | "bkash";
    transactionId: string;
    status: "pending" | "success" | "failed";
    rawResponse: unknown;
    createdAt: Date;
    updatedAt: Date;
}
