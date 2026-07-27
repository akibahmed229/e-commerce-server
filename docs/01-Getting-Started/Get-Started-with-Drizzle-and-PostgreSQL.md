# Get Started with Drizzle and PostgreSQL

## Overview

This guide explains how to configure **Drizzle ORM** with **PostgreSQL**, establish a database connection, define database schemas, and generate migrations for your e-commerce backend.

---

## Prerequisites

Before continuing, ensure you have:

* PostgreSQL installed or running via Docker
* A valid `DATABASE_URL` in your `.env` file

---

## 1. Install Dependencies

Install Drizzle ORM, PostgreSQL driver, and the required development tools.

```bash
npm install drizzle-orm pg dotenv
npm install -D drizzle-kit tsx @types/pg
```

---

## 2. Configure Environment Variables

Open your project's `.env` file and add the PostgreSQL connection string.

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
```

> Replace the placeholder values with your PostgreSQL username, password, host, and database name.

---

## 3. Configure Drizzle

Create a `drizzle.config.ts` file in the project root.

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/database/models",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Configuration Overview

| Property        | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `out`           | Directory where migration files are generated.             |
| `schema`        | Location of your database schema definitions.              |
| `dialect`       | Database type used by the project.                         |
| `dbCredentials` | Reads the database connection string from the environment. |

---

## 4. Create the Database Connection

Create a file such as `src/database/local-drizzle.ts` and initialize the PostgreSQL connection.

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db: NodePgDatabase = drizzle(pool);
```

This connection instance (`db`) is used throughout the application to perform database operations.

---

## 5. Define a Database Schema

Create a schema file inside your models directory.

Example:

```ts
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
```

Each schema represents a PostgreSQL table and defines its columns, constraints, and relationships.

---

## 6. Generate Migrations

After creating or updating your schemas, generate a migration.

```bash
npx drizzle-kit generate
```

Drizzle compares your schema definitions and creates SQL migration files in the configured output directory.

---

## 7. Apply Migrations

Run the generated migrations to create or update the database schema.

```bash
npx drizzle-kit migrate
```

---

## Verify the Setup

To verify everything is configured correctly:

* Ensure PostgreSQL is running.
* Confirm the database connection succeeds.
* Verify that migration files are generated in the `drizzle/` directory.
* Check that the tables have been created in your PostgreSQL database.

---

## Project Structure

After completing the setup, your project should contain the following files:

```text
.
├── drizzle/
├── drizzle.config.ts
├── .env
└── src
    └── database
        ├── local-drizzle.ts
        └── models
            └── user.schema.ts
```
