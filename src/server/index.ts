import { j } from "./jstack"
import { authRouter } from "./routers/auth-router"
import { chatRouter } from "./routers/chat-router"
import { completionRouter } from "./routers/completion-router"


const api = j
  .router()
  .basePath("/api")
  .use(j.defaults.cors)
  .onError(j.defaults.errorHandler)


const appRouter = j.mergeRouters(api, {
  user: authRouter,
  chat: chatRouter,
  completion: completionRouter,
})

export type AppRouter = typeof appRouter

export default appRouter