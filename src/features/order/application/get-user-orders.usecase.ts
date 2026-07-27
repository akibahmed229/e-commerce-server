import { IOrderRepository } from "../domain/order.repository";
import { OrderEntity } from "../domain/order.entity";
import { Result } from "@core/types/Result";

export class GetUserOrdersUseCase {
    constructor(private readonly repo: IOrderRepository) { }

    async execute(userId: string): Promise<Result<OrderEntity[], Error>> {
        const orders = await this.repo.getOrdersByUserId(userId);
        return Result.ok(orders);
    }
}
