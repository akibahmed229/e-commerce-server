import { Router } from "express";
import { OrderController } from "./order.controller";
import { CreateOrderUseCase } from "../application/create-order.usecase";
import { GetOrderByIdUseCase } from "../application/get-order-by-id.usecase";
import { GetUserOrdersUseCase } from "../application/get-user-orders.usecase";
import { DrizzleOrderRepository } from "../infrastructure/drizzle-order.repository";
import { db } from "@core/database/drizzle-client";
import { authenticate } from "@core/middlewares/authenticate";
import { validateRequest } from "@core/middlewares/validate-request";
import { createOrderSchema, orderIdParamSchema } from "./order.validation";

const router = Router();

const orderRepository = new DrizzleOrderRepository(db);
const createOrderUseCase = new CreateOrderUseCase(orderRepository);
const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);
const getUserOrdersUseCase = new GetUserOrdersUseCase(orderRepository);

const orderController = new OrderController(createOrderUseCase, getOrderByIdUseCase, getUserOrdersUseCase);

// every order route requires login — no public order access per spec
router.use(authenticate);

router.post("/",
    validateRequest(createOrderSchema, "body"),
    orderController.handleCreateOrder
);
router.get("/my-orders",
    orderController.handleGetMyOrders
);
router.get("/:id",
    validateRequest(orderIdParamSchema, "params"),
    orderController.handleGetOrderById
);

export { router as orderRoutes };
