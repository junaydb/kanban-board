import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
import * as schema from "./schema.js";

dotenv.config({ path: [".env.local", ".env"] });

let pool: pg.Pool;
if (process.env.DB_PROD === "true") {
  pool = new pg.Pool({
    database: "kanban_board",
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT!),
  });
} else {
  pool = new pg.Pool({
    database: "kanban_board_test",
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT!),
  });
}

export const db = drizzle(pool, { schema });
export { pool };
