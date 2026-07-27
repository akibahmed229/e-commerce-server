export interface OrderLineInput {
    productId: string;
    quantity: number;
    unitPrice: string; // numeric string, e.g. "89.99" — as stored in the DB
}

export interface OrderLineResult extends OrderLineInput {
    subtotal: string;
}

export interface OrderTotalsResult {
    lines: OrderLineResult[];
    totalAmount: string;
}

/**
 * Deterministic order total/subtotal calculator.
 *
 * Deterministic by construction:
 *  - Same input array always produces the same output, regardless of call order or environment.
 *  - Uses integer-cent arithmetic internally (not floating point) to guarantee
 *    no rounding drift accumulates across multiple line items or repeated calls.
 *  - Pure function — no I/O, no side effects, fully unit-testable in isolation.
 */
export class OrderCalculator {
    private static toCents(decimalString: string): number {
        // Math.round guards against floating imprecision at the single parse boundary only —
        // all subsequent arithmetic stays in integers.
        return Math.round(parseFloat(decimalString) * 100);
    }

    private static toDecimalString(cents: number): string {
        return (cents / 100).toFixed(2);
    }

    static calculate(lines: OrderLineInput[]): OrderTotalsResult {
        if (lines.length === 0) {
            throw new Error("Cannot calculate totals for an empty order");
        }

        let totalCents = 0;

        const results: OrderLineResult[] = lines.map((line) => {
            if (line.quantity <= 0) {
                throw new Error(`Invalid quantity for product ${line.productId}: ${line.quantity}`);
            }

            const unitCents = this.toCents(line.unitPrice);
            const subtotalCents = unitCents * line.quantity;
            totalCents += subtotalCents;

            return { ...line, subtotal: this.toDecimalString(subtotalCents) };
        });

        return { lines: results, totalAmount: this.toDecimalString(totalCents) };
    }
}
