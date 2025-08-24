import { initTRPC } from "@trpc/server";
import { auth } from "../util/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext({ req }: CreateExpressContextOptions) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return { ...session };
}

export type ExpressContext = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<ExpressContext>().create();
export const publicProcedure = t.procedure;
export const router = t.router;
