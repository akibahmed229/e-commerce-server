import { type Request, type Response } from "express";
import { CreateOrderUseCase } from "../application/create-order.usecase";
import { GetOrderByIdUseCase } from "../application/get-order-by-id.usecase";
import { GetUserOrdersUseCase } from "../application/get-user-orders.usecase";

export class OrderController {
    constructor(
        private readonly createOrder: CreateOrderUseCase,
        private readonly getOrderById: GetOrderByIdUseCase,
        private readonly getUserOrders: GetUserOrdersUseCase
    ) { }

    handleCreateOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.id; // guaranteed by `authenticate` middleware
            const result = await this.createOrder.execute({ userId, items: req.body.items });
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(201).json(result.value);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleGetOrderById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await this.getOrderById.execute({
                orderId: id.toString(),
                requesterId: req.user!.id,
                requesterRole: req.user!.role,
            });
            if (!result.ok) {
                const status = result.error.message === "Order not found" ? 404 : 403;
                res.status(status).json({ error: result.error.message });
                return;
            }
            res.status(200).json(result.value);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleGetMyOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.getUserOrders.execute(req.user!.id);
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json(result.value);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}
