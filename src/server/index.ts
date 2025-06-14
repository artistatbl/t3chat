import { j } from "./jstack"
import { authRouter } from "./routers/auth-router"
import { chatRouter } from "./routers/chat-router"
import { completionRouter } from "./routers/completion-router"

/**
 * This is your base API.
 * Here, you can handle errors, not-found responses, cors and more.
 *
 * @see https://jstack.app/docs/backend/app-router
 */
const api = j
  .router()
  .basePath("/api")
  .use(j.defaults.cors)
  .onError(j.defaults.errorHandler)

/**
 * This is the main router for your server.
 * All routers in /server/routers should be added here manually.
 */
const appRouter = j.mergeRouters(api, {
  user: authRouter,
  chat: chatRouter,
  completion: completionRouter,
})

export type AppRouter = typeof appRouter

export default appRouter