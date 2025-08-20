import { initTRPC } from "@trpc/server";
import { auth } from "../util/auth.js";
import type { Context } from "hono";

export async function createContext(c: Context) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return { session: session };
}

type HonoContext = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<HonoContext>().create();

export const publicProcedure = t.procedure;
export const router = t.router;
