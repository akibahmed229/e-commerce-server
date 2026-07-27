import { type Request, type Response } from "express";
import { CreateProductUseCase } from "../application/create-product.usecase";
import { GetAllProductUseCase } from "../application/get-all-product.usecase";
import { UpdateProductUseCase } from "../application/update-product.usecase";
import { DeleteProductUseCase } from "../application/delete-product.usecase";

export class ProductController {
    constructor(
        private readonly createProduct: CreateProductUseCase,
        private readonly getProducts: GetAllProductUseCase,
        private readonly updateProduct: UpdateProductUseCase,
        private readonly deleteProduct: DeleteProductUseCase
    ) { }

    handleCreateProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.createProduct.execute(req.body);
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(201).json(result.value);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleGetAllProducts = async (_req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.getProducts.execute();
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json(result.value);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleUpdateProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await this.updateProduct.execute({ id: id.toString(), data: req.body });
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json({ updated: result.value });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    handleDeleteProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await this.deleteProduct.execute({ id: id.toString() });
            if (!result.ok) {
                res.status(400).json({ error: result.error.message });
                return;
            }
            res.status(200).json({ deleted: result.value });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}
