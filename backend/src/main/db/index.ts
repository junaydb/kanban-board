import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

let dbUrl =
  process.env.PROD === "true" ? process.env.DB_URL! : process.env.DB_URL_TEST!;

const pool = new Pool({
  connectionString: dbUrl,
});
const db = drizzle({ client: pool });

const res = await db.execute(sql`SELECT current_database()`);

console.log("Connected to database: " + res.rows[0].current_database);

export default db;
