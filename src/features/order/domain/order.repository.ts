import { OrderEntity } from "./order.entity";

export interface CreateOrderItemInput {
    productId: string;
    quantity: number;
}

export interface CreateOrderInput {
    userId: string;
    items: CreateOrderItemInput[];
}

export interface IOrderRepository {
    createOrder(order: CreateOrderInput): Promise<OrderEntity>;
    getOrderById(id: string): Promise<OrderEntity | null>;
    getOrdersByUserId(userId: string): Promise<OrderEntity[]>;
    updateOrderStatus(id: string, status: "pending" | "paid" | "canceled"): Promise<boolean>;
    markOrderAsPaid(orderId: string): Promise<boolean>;
}
