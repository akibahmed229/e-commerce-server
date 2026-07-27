export interface OrderItemEntity {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: string;    // numeric snapshot at time of purchase
    subtotal: string;
}

export interface OrderEntity {
    id: string;
    userId: string;
    totalAmount: string;
    status: "pending" | "paid" | "canceled";
    createdAt: Date;
    updatedAt: Date;
    items?: OrderItemEntity[]; // populated on read, optional on write
}
