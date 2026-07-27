## Overview

Environment variables store configuration values that your application needs at runtime, such as server settings, database credentials, authentication secrets, and third-party API keys.

Create a `.env` file in the root directory of your project.

```text
project-root/
├── src/
├── package.json
├── tsconfig.json
└── .env
```

---

## Environment Variables

Copy the following template into your `.env` file and replace the placeholder values with your own configuration.

```env
# ==========================================
# Server Configuration
# ==========================================
PORT=4000

# ==========================================
# Database
# ==========================================
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>

# ==========================================
# JWT Authentication
# ==========================================
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# ==========================================
# Stripe
# ==========================================
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# ==========================================
# bKash (Sandbox)
# Replace with production credentials when deploying.
# ==========================================
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_USERNAME=sandboxTokenizedUser02
BKASH_PASSWORD=sandboxTokenizedUser02@12345
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret

# ==========================================
# Client Configuration
# ==========================================
API_BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

---

## Variable Reference

### Server

| Variable | Description                            |
| -------- | -------------------------------------- |
| `PORT`   | Port on which the backend server runs. |

### Database

| Variable       | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string used by Drizzle ORM and the application. |

### Authentication

| Variable               | Description                                |
| ---------------------- | ------------------------------------------ |
| `JWT_SECRET`           | Secret used to sign JWT tokens.            |
| `ACCESS_TOKEN_SECRET`  | Secret used for generating access tokens.  |
| `REFRESH_TOKEN_SECRET` | Secret used for generating refresh tokens. |

### Stripe

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `STRIPE_SECRET_KEY`     | Secret API key for Stripe.                      |
| `STRIPE_WEBHOOK_SECRET` | Secret used to verify incoming Stripe webhooks. |

### bKash

| Variable           | Description               |
| ------------------ | ------------------------- |
| `BKASH_BASE_URL`   | bKash API base URL.       |
| `BKASH_USERNAME`   | bKash API username.       |
| `BKASH_PASSWORD`   | bKash API password.       |
| `BKASH_APP_KEY`    | bKash application key.    |
| `BKASH_APP_SECRET` | bKash application secret. |

### Client

| Variable       | Description                                        |
| -------------- | -------------------------------------------------- |
| `API_BASE_URL` | Base URL of the backend API.                       |
| `FRONTEND_URL` | Frontend application's URL for CORS and redirects. |

---

## Security Notes

* Never commit your `.env` file to version control.
* Add `.env` to your `.gitignore` file.
* Use strong, randomly generated secrets for JWT authentication.
* Use sandbox credentials during development and production credentials only in deployment environments.
