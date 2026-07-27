import { IOrderRepository } from "../domain/order.repository";
import { OrderEntity } from "../domain/order.entity";
import { Result } from "@core/types/Result";

export interface GetOrderByIdDTO {
    orderId: string;
    requesterId: string;
    requesterRole: "user" | "admin";
}

export class GetOrderByIdUseCase {
    constructor(private readonly repo: IOrderRepository) { }

    async execute(input: GetOrderByIdDTO): Promise<Result<OrderEntity, Error>> {
        const order = await this.repo.getOrderById(input.orderId);
        if (!order) {
            return Result.fail(new Error("Order not found"));
        }

        // spec: "Users can view their own orders" — admins can view any
        if (input.requesterRole !== "admin" && order.userId !== input.requesterId) {
            return Result.fail(new Error("You do not have permission to view this order"));
        }

        return Result.ok(order);
    }
}
