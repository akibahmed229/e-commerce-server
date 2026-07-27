import axios from "axios";

interface CachedToken {
    idToken: string;
    expiresAt: number;
}

let cachedToken: CachedToken | null = null;
const baseURL = process.env.BKASH_BASE_URL!;


export class BkashGateway {
    private async getToken(): Promise<string> {
        if (cachedToken && cachedToken.expiresAt > Date.now()) {
            return cachedToken.idToken;
        }

        try {
            const { data } = await axios.post(
                `${baseURL}/tokenized/checkout/token/grant`,
                { app_key: process.env.BKASH_APP_KEY, app_secret: process.env.BKASH_APP_SECRET },
                { headers: { username: process.env.BKASH_USERNAME!, password: process.env.BKASH_PASSWORD!, "Content-Type": "application/json" } }
            );
            cachedToken = { idToken: data.id_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
            return cachedToken.idToken;
        } catch (error: any) {
            console.error("bKash token grant failed:", error.response?.data ?? error.message);
            throw new Error(`bKash authentication failed: ${JSON.stringify(error.response?.data ?? error.message)}`);
        }
    }

    private async header() {
        return {
            Authorization: await this.getToken(),
            "X-APP-Key": process.env.BKASH_APP_KEY!,
            "Content-Type": "application/json"
        }
    }

    async createPayment(amount: number, orderId: string, callbackURL: string) {
        const { data } = await axios.post(
            `${baseURL}/tokenized/checkout/create`,
            {
                mode: "0011",
                payerReference: orderId,
                callbackURL,
                amount: amount.toFixed(2),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: orderId,
            },
            { headers: await this.header() }
        )

        return data;
    }

    async executePayment(paymentID: string) {
        const { data } = await axios.post(`${baseURL}/tokenized/checkout/execute`, { paymentID }, { headers: await this.header() });
        return data;
    }

    async queryPayment(paymentID: string) {
        const { data } = await axios.post(`${baseURL}/tokenized/checkout/payment/status`, { paymentID }, { headers: await this.header() });
        return data;
    }
}
