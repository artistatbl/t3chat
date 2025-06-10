import { jstack } from "jstack"

interface Env {
  Bindings: { NEXT_PUBLIC_CONVEX_URL: string }
}

export const j = jstack.init<Env>()

/**
 * Public (unauthenticated) procedures
 */
export const publicProcedure = j.procedure