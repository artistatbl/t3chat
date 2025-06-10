import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
  
  chats: defineTable({
    uuid: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["uuid"])
    .index("by_user", ["userId"]),
  
  messages: defineTable({
    uuid: v.string(),
    chatId: v.string(),
    userId: v.string(),
    role: v.string(), // "user" or "assistant"
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_uuid", ["uuid"])
    .index("by_chat", ["chatId"])
    .index("by_chat_created", ["chatId", "createdAt"]),
});