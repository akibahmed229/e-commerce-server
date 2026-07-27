import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { CreatePaymentInput, IPaymentRepository } from "../domain/payment.repository";
import { PaymentEntity } from "../domain/payment.entity";
import { paymentsTable } from "./persistence/payment.schema";
import { eq } from "drizzle-orm";

export class DrizzlePaymentRepository implements IPaymentRepository {
    constructor(private readonly db: NodePgDatabase) { }

    async createPayment(input: CreatePaymentInput): Promise<PaymentEntity> {
        const [payment] = await this.db.insert(paymentsTable).values({
            orderId: input.orderId,
            provider: input.provider,
            transactionId: input.transactionId,
            status: input.status,
            rawResponse: input.rawResponse ?? null
        }).returning();

        return payment;
    }

    async updatePaymentStatus(transactionId: string, status: "pending" | "success" | "failed", rawResponse?: unknown): Promise<PaymentEntity | null> {
        const [payment] = await this.db
            .update(paymentsTable)
            .set({ status, ...(rawResponse !== undefined ? { rawResponse } : {}) })
            .where(eq(paymentsTable.transactionId, transactionId))
            .returning();

        return payment ?? null;
    }

    async findByTransactionId(transactionId: string): Promise<PaymentEntity | null> {
        const [payment] = await this.db.select().from(paymentsTable).where(eq(paymentsTable.transactionId, transactionId));
        return payment ?? null;
    }

    async findByOrderId(orderId: string): Promise<PaymentEntity[]> {
        return this.db.select().from(paymentsTable).where(eq(paymentsTable.orderId, orderId));
    }
}
