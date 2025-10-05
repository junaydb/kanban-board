import dotenv from "dotenv";
dotenv.config();

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/main/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.NODE_ENV == "prod"
        ? process.env.DB_URL!
        : process.env.DB_URL_TEST!,
  },
});
