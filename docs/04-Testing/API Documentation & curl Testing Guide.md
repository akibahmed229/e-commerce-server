Base URL used throughout: `http://localhost:4000/api/v1`

> **Note**: `product` routes aren't included below since they weren't in this batch — say the word if you want those documented the same way.

Save these as shell variables to keep the curl commands short:
```bash
export BASE_URL="http://localhost:4000/api/v1"
```

---

## 1. User — `/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users` | Public | Register a new user |
| GET | `/users` | Required | List all users |
| PATCH | `/users/:id` | Required | Update a user |
| DELETE | `/users/:id` | Required | Delete a user |
| POST | `/users/jwt/login` | Public | Log in, get access token + refresh cookie |
| POST | `/users/jwt/refresh` | Public (cookie) | Issue a new access token |
| POST | `/users/jwt/logout` | Public (cookie) | Clear refresh cookie |

### POST `/users` — Register

```bash
curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Akib Ahmed",
    "email": "akib@example.com",
    "password": "securePass123"
  }'
```
**Expected**: `201`, returns created user (no `passwordHash`).

### POST `/users/jwt/login` — Log in

```bash
curl -c cookies.txt -X POST "$BASE_URL/users/jwt/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "akib@example.com",
    "password": "securePass123"
  }'
```
**Expected**: `200`, `{ accessToken, user }`. `-c cookies.txt` saves the `jwt` refresh cookie to a file for reuse below.

Save the token for reuse:
```bash
export ACCESS_TOKEN="paste_the_accessToken_value_here"
```

### GET `/users` — List all users

```bash
curl -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
**Expected**: `200`, array of users (no `passwordHash`). `401` if token missing/expired.

### PATCH `/users/:id` — Update a user

```bash
curl -X PATCH "$BASE_URL/users/<user-uuid>" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Akib Updated"
  }'
```
**Expected**: `200`, `{ updated: true }`. `400` if `id` isn't a valid UUID or no fields provided.

### DELETE `/users/:id` — Delete a user

```bash
curl -X DELETE "$BASE_URL/users/<user-uuid>" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
**Expected**: `200`, `{ deleted: true }`.

### POST `/users/jwt/refresh` — Refresh access token

```bash
curl -b cookies.txt -X POST "$BASE_URL/users/jwt/refresh"
```
**Expected**: `200`, new `{ accessToken }`. `401` if no refresh cookie sent, `403` if expired/invalid.

### POST `/users/jwt/logout` — Log out

```bash
curl -b cookies.txt -X POST "$BASE_URL/users/jwt/logout"
```
**Expected**: `204`, clears the refresh cookie.

---

## 2. Product — `/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List all products |
| POST | `/products` | Admin only | Create a product |
| PATCH | `/products/:id` | Admin only | Update a product |
| DELETE | `/products/:id` | Admin only | Delete a product |

> Note: your spec also mentions "Users can view product lists and **details**" (singular product by id), but there's no `GET /products/:id` route currently wired — only list-all exists. Flagging this gap; let me know if you want that added.

### GET `/products` — List all products

```bash
curl -X GET "$BASE_URL/products"
```
**Expected**: `200`, array of all products. No auth required.

### POST `/products` — Create product (admin only)

```bash
curl -X POST "$BASE_URL/products" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mechanical Keyboard",
    "sku": "KB-MECH-001",
    "description": "75% layout, hot-swappable switches",
    "price": 89.99,
    "stock": 50,
    "status": "active"
  }'
```
**Expected**: `201`, created product with generated `id`/timestamps.
`401` if no token. `403` if token belongs to a `"user"` role, not `"admin"`. `400` on invalid body (e.g. negative price, missing `sku`).

### PATCH `/products/:id` — Update product (admin only)

```bash
curl -X PATCH "$BASE_URL/products/<product-uuid>" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 79.99,
    "stock": 40
  }'
```
**Expected**: `200`, `{ updated: true }`. `400` if `id` isn't a valid UUID or no fields provided. `403` for non-admin.

### DELETE `/products/:id` — Delete product (admin only)

```bash
curl -X DELETE "$BASE_URL/products/<product-uuid>" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```
**Expected**: `200`, `{ deleted: true }`. `403` for non-admin.

Note from earlier in this build: your Drizzle FK on `order_items.productId` is `onDelete: "restrict"` — deleting a product that's already been ordered will throw a DB-level foreign key error here, surfaced as a `500`. Worth testing this specific case deliberately:
```bash
# create a product, order it, then try to delete it — expect a DB constraint failure
curl -X DELETE "$BASE_URL/products/<already-ordered-product-uuid>" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```
If this matters for your workflow, the earlier recommendation still stands — prefer setting `status: "inactive"` via `PATCH` over a hard `DELETE` once a product has order history.

---

## Setup note: getting an admin token to test with

Nothing in the current `create-user` flow lets a client set `role: "admin"` (rightly — `CreateUserDTO` doesn't expose it, so no one can self-promote via the API). To get an admin token for testing, promote a user directly in the DB:

```bash
docker compose exec ecommerce-database psql -U postgres -d ecommerce \
  -c "UPDATE users SET role = 'admin' WHERE email = 'test@example.com';"
```

Then log in again as that user — the JWT is signed with the role captured at login time, so a token issued *before* the promotion still says `"user"`:
```bash
curl -c cookies.txt -X POST "$BASE_URL/users/jwt/login" -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
export ADMIN_ACCESS_TOKEN="<paste new accessToken from response>"
```

---

## 3. Order — `/orders`

Every route requires `Authorization: Bearer $ACCESS_TOKEN` (`router.use(authenticate)` applies to the whole router).

| Method | Path                | Description                         |
| ------ | ------------------- | ----------------------------------- |
| POST   | `/orders`           | Create an order from cart items     |
| GET    | `/orders/my-orders` | List the logged-in user's orders    |
| GET    | `/orders/:id`       | Get one order (owner or admin only) |

### POST `/orders` — Create order

```bash
curl -X POST "$BASE_URL/orders" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": "<product-uuid-1>", "quantity": 2 },
      { "productId": "<product-uuid-2>", "quantity": 1 }
    ]
  }'
```
**Expected**: `201`, created order with `items`, computed `totalAmount`, `status: "pending"`. `400` on insufficient stock, inactive product, or empty `items`.

Save the order id:
```bash
export ORDER_ID="paste_the_order_id_here"
```

### GET `/orders/my-orders` — List my orders

```bash
curl -X GET "$BASE_URL/orders/my-orders" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
**Expected**: `200`, array of the logged-in user's orders (empty array if none yet).

### GET `/orders/:id` — Get order by id

```bash
curl -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
**Expected**: `200` if you own it (or you're admin). `404` if it doesn't exist. `403` if it belongs to someone else.

---

## 4. Payment — `/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments/stripe/webhook` | Public, signature-verified | Stripe → your server notifications |
| GET | `/payments/bkash/callback` | Public | bKash browser redirect target |
| POST | `/payments/stripe/create-intent` | Required | Start a Stripe payment |
| POST | `/payments/bkash/initiate` | Required | Start a bKash payment |
| GET | `/payments/bkash/query/:paymentID` | Required | Check a bKash payment's status |

### POST `/payments/stripe/create-intent` — Start Stripe payment

```bash
curl -X POST "$BASE_URL/payments/stripe/create-intent" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{ \"orderId\": \"$ORDER_ID\" }"
```
**Expected**: `200`, `{ clientSecret }` — hand this to the frontend's Stripe.js to collect card details. `400` if order isn't yours or isn't `pending`.

### POST `/payments/stripe/webhook` — Stripe → you (not manually curl-able in practice)

This route needs a *real, signed* Stripe event — you can't fabricate a valid signature by hand. Test it via the Stripe CLI instead:
```bash
stripe listen --forward-to localhost:4000/api/v1/payments/stripe/webhook
```
In a second terminal, trigger a fake event:
```bash
stripe trigger payment_intent.succeeded
```
**Expected**: your server logs `200 { received: true }`; check the `payments` table — `status` should flip to `success` and the linked order to `paid`.

If you want a raw curl call purely to confirm the route rejects unsigned requests (expected to fail):
```bash
curl -X POST "$BASE_URL/payments/stripe/webhook" \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded"}'
```
**Expected**: `400`, signature verification failure — this is correct behavior, not a bug.

### POST `/payments/bkash/initiate` — Start bKash payment

```bash
curl -X POST "$BASE_URL/payments/bkash/initiate" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{ \"orderId\": \"$ORDER_ID\" }"
```
**Expected**: `200`, `{ bkashURL }` — redirect the user's browser here to complete payment on bKash's sandbox page.

### GET `/payments/bkash/callback` — bKash → you (browser redirect, not typically curled)

bKash redirects the *browser* here after payment, with real query params it generates — you can simulate the shape for a dry run, but `paymentID` needs to be one that actually exists from a real `initiate` call:
```bash
curl -i "$BASE_URL/payments/bkash/callback?paymentID=<real-paymentID-from-initiate>&status=success"
```
**Expected**: `302` redirect to `FRONTEND_URL/payment/success` or `/failed`, depending on what the real `execute` call against bKash's sandbox returns.

### GET `/payments/bkash/query/:paymentID` — Check payment status

```bash
curl -X GET "$BASE_URL/payments/bkash/query/<paymentID>" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
**Expected**: `200`, raw bKash status response.

---

## 5. Suggested End-to-End Test Sequence

```bash
# 1. Register + promote to admin (DB-level, see above) + log in as admin
export ADMIN_ACCESS_TOKEN="<paste accessToken>"

# 2. Admin creates a product
curl -X POST "$BASE_URL/products" -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Mechanical Keyboard","sku":"KB-MECH-001","description":"75% layout","price":89.99,"stock":50,"status":"active"}'
export PRODUCT_ID="<paste id from response>"

# 3. Regular user registers, logs in
curl -X POST "$BASE_URL/users" -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
curl -c cookies.txt -X POST "$BASE_URL/users/jwt/login" -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
export ACCESS_TOKEN="<paste accessToken>"

# 4. User browses products (public)
curl -X GET "$BASE_URL/products"

# 5. User creates an order using the real product id
curl -X POST "$BASE_URL/orders" -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d "{\"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":1}]}"
export ORDER_ID="<paste id from response>"

# 6. User pays via Stripe
curl -X POST "$BASE_URL/payments/stripe/create-intent" -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\"}"

# 7. Confirm via Stripe CLI (separate terminal running `stripe listen`)
stripe trigger payment_intent.succeeded

# 8. Verify order is "paid" and product stock decremented
curl -X GET "$BASE_URL/orders/$ORDER_ID" -H "Authorization: Bearer $ACCESS_TOKEN"
curl -X GET "$BASE_URL/products"
```
