import { IOrderRepository, CreateOrderInput } from "../domain/order.repository";
import { OrderEntity } from "../domain/order.entity";
import { Result } from "@core/types/Result";

export class CreateOrderUseCase {
    constructor(private readonly repo: IOrderRepository) { }

    async execute(input: CreateOrderInput): Promise<Result<OrderEntity, Error>> {
        if (!input.items || input.items.length === 0) {
            return Result.fail(new Error("Order must contain at least one item"));
        }

        try {
            const order = await this.repo.createOrder(input);
            return Result.ok(order);
        } catch (error: any) {
            return Result.fail(new Error(error.message ?? "Failed to create order"));
        }
    }
}
