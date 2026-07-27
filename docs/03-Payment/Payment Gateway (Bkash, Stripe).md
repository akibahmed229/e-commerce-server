## 1. Core Concept

Every payment gateway integration follows the same lifecycle, regardless of provider:

```
Create payment → User pays → Provider confirms → You verify → You update order/stock
```

You never handle raw card numbers or bank credentials — the provider does. Your server's job is to initiate, verify, and record.

**The two confirmation patterns:**

| Pattern | How | Provider |
|---|---|---|
| **Webhook-driven** | Provider calls your server directly when status changes | Stripe |
| **Callback + server-to-server verify** | Provider redirects the browser, then you separately confirm via API | bKash |

Never trust a browser redirect alone as proof of payment — always verify server-to-server (webhook signature, or an explicit "execute"/"query" call).

---

## 2. Shared Data Model

One `payments` table, provider-agnostic:

```ts
interface Payment {
  id: string;
  orderId: string;
  provider: "stripe" | "bkash";
  transactionId: string;   // unique — your idempotency key
  status: "pending" | "success" | "failed";
  rawResponse: unknown;    // always store the full provider response
  createdAt: Date;
  updatedAt: Date;
}
```

`transactionId` uniqueness is what makes webhook/callback handlers idempotent — providers redeliver notifications, and your handler must produce the same end state whether it runs once or five times.

---

## 3. Setup

```bash
npm install stripe axios
```

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# bKash sandbox
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_USERNAME=sandboxTokenizedUser02
BKASH_PASSWORD=sandboxTokenizedUser02@12345
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
```

---

## 4. Stripe

Stripe uses the **Payment Intents API** + webhooks. Card details are handled entirely on the frontend via Stripe.js — your server never sees them (PCI compliance by design).

### 4.1 Create a payment intent

```ts
// gateways/stripe.gateway.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(amount: number, currency: string, orderId: string) {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe wants the smallest currency unit (cents)
    currency,
    metadata: { orderId },            // lets you trace the intent back to your order
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: intent.client_secret!, paymentIntentId: intent.id };
}
```

```ts
// route handler
app.post("/payments/stripe/create-intent", authenticate, async (req, res) => {
  const order = await getOrderById(req.body.orderId);
  if (order.userId !== req.user.id || order.status !== "pending") {
    return res.status(400).json({ error: "Invalid order" });
  }

  const { clientSecret, paymentIntentId } = await createPaymentIntent(
    Number(order.totalAmount),
    "usd",
    order.id
  );

  await savePayment({ orderId: order.id, provider: "stripe", transactionId: paymentIntentId, status: "pending" });

  res.json({ clientSecret }); // frontend uses this with Stripe.js to collect card details
});
```

**Amount always comes from the order in your DB** — never from a value the client sends. Otherwise a modified request could pay $1 for a $1,000 order.

### 4.2 Frontend confirms payment (reference only — not your backend's job)

```js
// frontend, using @stripe/stripe-js — shown for context only
const { error } = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: { return_url: "https://yoursite.com/order/complete" },
});
```

### 4.3 Webhook — the actual source of truth

```ts
// route: MUST receive the raw request body, not parsed JSON
import { raw } from "express";

app.post("/payments/stripe/webhook", raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await updatePaymentStatus(intent.id, "success", intent);
      if (payment) await markOrderAsPaid(payment.orderId); // idempotent — see §6
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await updatePaymentStatus(intent.id, "failed", intent);
      break;
    }
  }

  res.status(200).json({ received: true }); // respond fast — Stripe retries on non-2xx/timeout
});
```

**Why raw body matters**: `stripe.webhooks.constructEvent` verifies the signature against the *exact bytes* sent. If `express.json()` runs first globally and consumes the stream, there's nothing left for signature verification — it will always fail. Register the raw-body route for this specific path **before** any global JSON parser touches it:

```ts
app.use((req, res, next) => {
  if (req.originalUrl === "/payments/stripe/webhook") return next(); // let the raw() middleware on the route handle it
  express.json()(req, res, next);
});
```

### 4.4 Local testing

```bash
stripe listen --forward-to localhost:4000/payments/stripe/webhook
```
Prints a `whsec_...` value — use it as your local `STRIPE_WEBHOOK_SECRET`.

---

## 5. bKash

bKash uses **token auth + a three-step tokenized checkout flow**: create → (user pays on bKash's page) → execute → optionally query. No webhooks — you verify via a server-to-server "execute" call triggered by the callback redirect.

### 5.1 Token management

bKash requires a bearer token for every call, fetched separately and cached until near expiry.

```ts
// gateways/bkash.gateway.ts
import axios from "axios";

const baseURL = process.env.BKASH_BASE_URL!;
let cachedToken: { idToken: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.idToken;

  const { data } = await axios.post(
    `${baseURL}/tokenized/checkout/token/grant`,
    { app_key: process.env.BKASH_APP_KEY, app_secret: process.env.BKASH_APP_SECRET },
    { headers: { username: process.env.BKASH_USERNAME!, password: process.env.BKASH_PASSWORD!, "Content-Type": "application/json" } }
  );

  cachedToken = { idToken: data.id_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.idToken;
}

async function headers() {
  return { Authorization: await getToken(), "X-APP-Key": process.env.BKASH_APP_KEY!, "Content-Type": "application/json" };
}
```

### 5.2 Create payment

```ts
export async function createBkashPayment(amount: number, orderId: string, callbackURL: string) {
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
    { headers: await headers() }
  );
  return data; // { paymentID, bkashURL, ... }
}
```

```ts
app.post("/payments/bkash/initiate", authenticate, async (req, res) => {
  const order = await getOrderById(req.body.orderId);
  if (order.userId !== req.user.id || order.status !== "pending") {
    return res.status(400).json({ error: "Invalid order" });
  }

  const callbackURL = `${process.env.API_BASE_URL}/payments/bkash/callback`;
  const result = await createBkashPayment(Number(order.totalAmount), order.id, callbackURL);

  if (!result.paymentID || !result.bkashURL) {
    return res.status(400).json({ error: result.statusMessage ?? "Failed to initiate payment" });
  }

  await savePayment({ orderId: order.id, provider: "bkash", transactionId: result.paymentID, status: "pending", rawResponse: result });

  res.json({ bkashURL: result.bkashURL }); // redirect the user's browser here
});
```

### 5.3 Execute — the actual confirmation step

bKash redirects the browser back to your `callbackURL` with `?paymentID=...&status=...` in the query string. **Do not trust that `status` value** — it's just a UI hint, not a payment confirmation. Always call `execute` server-to-server:

```ts
export async function executeBkashPayment(paymentID: string) {
  const { data } = await axios.post(`${baseURL}/tokenized/checkout/execute`, { paymentID }, { headers: await headers() });
  return data;
}
```

```ts
app.get("/payments/bkash/callback", async (req, res) => {
  const { paymentID, status } = req.query as { paymentID: string; status: string };

  if (status !== "success") {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?paymentID=${paymentID}`);
  }

  const result = await executeBkashPayment(paymentID); // this is the real confirmation

  const success = result.transactionStatus === "Completed" || result.statusCode === "0000";
  const payment = await updatePaymentStatus(paymentID, success ? "success" : "failed", result);

  if (success && payment) await markOrderAsPaid(payment.orderId); // idempotent — see §6

  res.redirect(`${process.env.FRONTEND_URL}/payment/${success ? "success" : "failed"}?paymentID=${paymentID}`);
});
```

### 5.4 Query — for reconciliation / status checks after the fact

```ts
export async function queryBkashPayment(paymentID: string) {
  const { data } = await axios.post(`${baseURL}/tokenized/checkout/payment/status`, { paymentID }, { headers: await headers() });
  return data;
}
```
Useful when a user abandons the flow mid-way and you need to check the true state later, rather than relying on the callback firing.

---

## 6. Idempotent Order Update (shared by both providers)

Both Stripe webhooks and bKash execute calls can fire more than once for the same transaction (network retries, duplicate browser navigation). Guard against double-processing:

```ts
async function markOrderAsPaid(orderId: string) {
  const order = await getOrderById(orderId);
  if (order.status === "paid") return; // already processed — do nothing

  await db.transaction(async (tx) => {
    for (const item of order.items) {
      await decrementStock(tx, item.productId, item.quantity);
    }
    await tx.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
  });
}
```

Without the `if already paid, return` guard, a duplicate webhook delivery would double-decrement stock.

---

## 7. Security Checklist

| Rule | Applies to |
|---|---|
| Verify signatures on every webhook | Stripe (`constructEvent`) |
| Never trust redirect query params alone | bKash (`?status=success` is not proof) |
| Amount always from your DB, never client input | Both |
| Raw request body preserved for signature verification | Stripe |
| Idempotent order-update logic | Both |
| Store full `rawResponse` for every payment attempt | Both |
| Test in sandbox mode exclusively during dev | Both |

---

## 8. Quick Reference — Which Call Does What

| Step               | Stripe                              | bKash                                                       |
| ------------------ | ----------------------------------- | ----------------------------------------------------------- |
| Start payment      | `paymentIntents.create()`           | `POST /checkout/create`                                     |
| User pays          | Stripe.js on frontend               | Redirect to `bkashURL`                                      |
| Confirm            | Webhook: `payment_intent.succeeded` | `POST /checkout/execute` (triggered by your callback route) |
| Check status later | `paymentIntents.retrieve()`         | `POST /checkout/payment/status`                             |
| Auth model         | Secret key per request              | Cached bearer token, refreshed on expiry                    |