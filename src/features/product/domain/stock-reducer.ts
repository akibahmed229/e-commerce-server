export interface StockReductionRequest {
    productId: string;
    quantity: number;
}

export interface StockReductionResult {
    productId: string;
    success: boolean;
    remainingStock?: number;
}

/**
 * Contract for safely reducing stock. "Safe" here means:
 *  - Atomic: the availability check and the decrement happen as one indivisible operation.
 *  - Deterministic: given the same starting stock and the same sequence of committed
 *    reductions, the final stock value is always the same, regardless of concurrency timing.
 *  - Never produces negative stock, even under concurrent calls for the same product.
 */
export interface IStockReducer {
    reduce(requests: StockReductionRequest[]): Promise<StockReductionResult[]>;
}
