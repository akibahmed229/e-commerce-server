To execute payment transactions on your backend, both payment platforms require explicit API credentials, environment variables, merchant accounts, and security configurations.

---

## 1. Stripe Prerequisites & Credentials

Stripe is straightforward to set up, using **Key Pairs** divided into Test (Sandbox) and Live environments.

### Required Account Setup

1. **Create a Stripe Account:** Register at [dashboard.stripe.com](https://dashboard.stripe.com).
2. **Business Verification (For Live Mode):** Provide business registration details, bank account info, and tax/ID documentation to accept real credit/debit card payments.

### Credentials You Need to Collect

| Variable Name | Prefix | Description / Location |
| --- | --- | --- |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_` / `pk_live_` | Safe for frontend code. Used by Stripe Elements to tokenize card inputs. Found in **Dashboard > Developers > API keys**. |
| `STRIPE_SECRET_KEY` | `sk_test_` / `sk_live_` | **Backend Only**. Authenticates server requests to Stripe APIs. Found in **Dashboard > Developers > API keys**. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_` | **Backend Only**. Verifies that incoming payment notifications truly originate from Stripe. Found in **Dashboard > Developers > Webhooks** after adding an endpoint. |

### `.env` File Example for Stripe

```env
# Stripe Environment Variables
STRIPE_PUBLISHABLE_KEY=pk_test_51Nx...
STRIPE_SECRET_KEY=sk_test_51Nx...
STRIPE_WEBHOOK_SECRET=whsec_a1b2c3d4...

```

---

## 2. bKash Prerequisites & Credentials

bKash uses a **Tokenized Checkout API** flow. Setting up bKash requires formal business verification before you are issued merchant credentials.

### Required Account Setup

1. **Apply for a bKash Merchant Account:** Submit an application on the bKash Merchant/Business portal.
2. **Submit Required Business Documents:**
* Valid Trade License
* National ID (NID) of the proprietor/directors
* Business Bank Account details
* TIN (Tax Identification Number) certificate


3. **KYC & Contract Approval:** Once bKash approves your application, they will issue sandbox credentials and later sign a merchant contract for live access.

### Credentials You Need to Collect

| Variable Name | Description |
| --- | --- |
| `BKASH_BASE_URL` | Sandbox: `[https://tokenized.sandbox.bKash.com/v1.2.0-beta](https://tokenized.sandbox.bKash.com/v1.2.0-beta)`<br>

<br>Live: Provided by bKash upon contract sign-off. |
| `BKASH_APP_KEY` | Issued via the bKash Developer/Merchant portal. Used in API header requests. |
| `BKASH_APP_SECRET` | Secret key paired with your App Key. Used during the token generation phase. |
| `BKASH_USERNAME` | Merchant API account username. Required to grant authorization tokens. |
| `BKASH_PASSWORD` | Merchant API account password. Required to grant authorization tokens. |

### `.env` File Example for bKash

```env
# bKash Sandbox Environment Variables
BKASH_BASE_URL=https://tokenized.sandbox.bKash.com/v1.2.0-beta
BKASH_APP_KEY=4f6o0cjiki2rfm34kfdadl1eqq
BKASH_APP_SECRET=2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b
BKASH_USERNAME=sandboxTokenizedUser02
BKASH_PASSWORD=sandboxTokenizedUser02@12345

```

---

## 3. Webhook & Callback Setup Requirements

Both gateways require publicly accessible URL endpoints on your backend to handle asynchronous events and payment updates.

### Stripe Webhook Setup

* **Local Development:** When testing locally, run the **Stripe CLI** to forward events to your localhost server:
```bash
stripe listen --forward-to localhost:3000/webhook

```


* **Production:** Go to **Stripe Dashboard > Developers > Webhooks**, add your production endpoint (e.g., `[https://api.yourdomain.com/webhook](https://api.yourdomain.com/webhook)`), and select events like `payment_intent.succeeded` and `payment_intent.payment_failed`.

### bKash Callback Setup

* **Callback URL Endpoint:** Specify a publicly accessible endpoint (e.g., `[https://api.yourdomain.com/bkash/callback](https://api.yourdomain.com/bkash/callback)`) in the `callbackURL` field during the `/checkout/create` API call.
* **Network Access:** Ensure your server allows incoming HTTP/HTTPS traffic from bKash's IP ranges if behind strict firewalls.