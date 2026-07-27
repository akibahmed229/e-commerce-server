import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './src/core/database/schema/index.ts',
    dialect: 'postgresql',
    dbCredentials: {
        host: "localhost",
        port: 5430,
        database: "ecommerce",
        user: "postgres",
        password: "postgres",
        ssl: false,
    },
});

