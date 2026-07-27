import { Router } from "express";
import { ProductController } from "./product.controller";
import { CreateProductUseCase } from "../application/create-product.usecase";
import { GetAllProductUseCase } from "../application/get-all-product.usecase";
import { UpdateProductUseCase } from "../application/update-product.usecase";
import { DeleteProductUseCase } from "../application/delete-product.usecase";
import { DrizzleProductRepository } from "../infrastructure/drizzle-product.repository";
import { db } from "@core/database/drizzle-client";
import { validateRequest } from "@core/middlewares/validate-request";
import { createProductSchema, updateProductSchema, productIdParamSchema } from "./product.validation";
import { authorize } from "@core/middlewares/authorize";
import { authenticate } from "@core/middlewares/authenticate";

const router = Router();

const productRepository = new DrizzleProductRepository(db);
const createProductUseCase = new CreateProductUseCase(productRepository);
const getProductUseCase = new GetAllProductUseCase(productRepository);
const updateProductUseCase = new UpdateProductUseCase(productRepository);
const deleteProductUseCase = new DeleteProductUseCase(productRepository);

const productController = new ProductController(
    createProductUseCase,
    getProductUseCase,
    updateProductUseCase,
    deleteProductUseCase
);

// public/any authenticated user — read-only
router.get("/",
    productController.handleGetAllProducts
);

// admin only — mutations
router.post("/",
    authenticate,
    authorize("admin"),
    validateRequest(createProductSchema, "body"),
    productController.handleCreateProduct
);
router.patch(
    "/:id",
    authenticate,
    authorize("admin"),
    validateRequest(productIdParamSchema, "params"),
    validateRequest(updateProductSchema, "body"),
    productController.handleUpdateProduct
);
router.delete("/:id",
    authenticate,
    authorize("admin"),
    validateRequest(productIdParamSchema, "params"),
    productController.handleDeleteProduct
);

export { router as productRoutes };
