import { IOrderRepository } from "../domain/order.repository";
import { Result } from "@core/types/Result";

export interface UpdateOrderStatusDTO {
    orderId: string;
    status: "pending" | "paid" | "canceled";
}

export class UpdateOrderStatusUseCase {
    constructor(private readonly repo: IOrderRepository) { }

    async execute(input: UpdateOrderStatusDTO): Promise<Result<boolean, Error>> {
        const updated = await this.repo.updateOrderStatus(input.orderId, input.status);
        if (!updated) {
            return Result.fail(new Error("Failed to update order status"));
        }
        return Result.ok(updated);
    }
}
