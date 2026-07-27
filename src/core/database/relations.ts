import { defineRelations } from "drizzle-orm";
import { orderItemsTable, ordersTable, paymentsTable, productsTable, usersTable } from "./schema";

const schema = {
    users: usersTable,
    products: productsTable,
    orders: ordersTable,
    orderItems: orderItemsTable,
    payments: paymentsTable,
};

export const relations = defineRelations(schema, (r) => ({
    users: {
        orders: r.many.orders(),
    },

    orders: {
        user: r.one.users({
            from: r.orders.userId,
            to: r.users.id,
        }),
        items: r.many.orderItems(),
        payments: r.many.payments(),
    },

    orderItems: {
        order: r.one.orders({
            from: r.orderItems.orderId,
            to: r.orders.id,
        }),
        product: r.one.products({
            from: r.orderItems.productId,
            to: r.products.id,
        }),
    },

    products: {
        orderItems: r.many.orderItems(),
    },
    payments: {
        order: r.one.orders({          // fixed: was r.one.payments
            from: r.payments.orderId,
            to: r.orders.id,
        }),
    }
}));

export type Schema = typeof schema;
