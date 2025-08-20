import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/main/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DB_PROD == "true"
        ? process.env.DB_URL!
        : process.env.DB_URL_TEST!,
  },
});

