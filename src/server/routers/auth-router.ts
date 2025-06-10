import { j, publicProcedure } from "../jstack"
import { currentUser } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../convex/_generated/api"

export const dynamic = "force-dynamic"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export const authRouter = j.router({
  // Get database sync status and create user if needed
  getDatabaseSyncStatus: publicProcedure.query(async ({ c }) => {
    const auth = await currentUser()

    if (!auth) {
      return c.json({ isSynced: false })
    }

    const user = await convex.query(api.users.getUserByClerkId, {
      clerkId: auth.id,
    })

    console.log('USER IN DB:', user)

    if (!user) {
      await convex.mutation(api.users.createUser, {
        clerkId: auth.id,
        email: auth.emailAddresses[0]?.emailAddress ?? '',
      })
    }

    return c.json({ isSynced: true })
  }),
})