import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

let db: NodePgDatabase<typeof schema>;

if (process.env.DB_PROD === "true") {
  db = drizzle(process.env.DB_URL!, { schema: schema });
} else {
  db = drizzle(process.env.DB_URL_TEST!, { schema: schema });
}

export default db;
