import { BkashGateway } from "../infrastructure/gateways/bkash.gateway";
import { Result } from "@core/types/Result";

export class QueryBkashPaymentUseCase {
    constructor(private readonly bkashGateway: BkashGateway) { }

    async execute(paymentID: string): Promise<Result<unknown, Error>> {
        const result = await this.bkashGateway.queryPayment(paymentID);
        return Result.ok(result);
    }
}
