export interface ProductEntity {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    /*Postgres numeric columns come back from node-postgres as strings, not JS numbers (to avoid float precision loss on money values) — price: 
     * number will actually be wrong at runtime even though TS won't catch it unless you check the Drizzle inferred type. Use string and parse to number only when doing arithmetic, 
     * or cast explicitly at the boundary.*/
    price: string;
    stock: number;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}
