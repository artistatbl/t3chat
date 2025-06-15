import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    displayName: v.optional(v.string()), // What T3 Chat should call you (max 50 chars)
    occupation: v.optional(v.string()), // What you do (max 100 chars)
    traits: v.optional(v.array(v.string())), // User traits (up to 50 traits, max 100 chars each)
    bio: v.optional(v.string()), // Additional information (max 3000 chars)
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
  
  chats: defineTable({
    uuid: v.string(),
    userId: v.string(),
    title: v.string(),
    pinned: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["uuid"])
    .index("by_user", ["userId"]),
  
  messages: defineTable({
    uuid: v.string(),
    chatId: v.string(),
    userId: v.string(),
    role: v.string(),
    content: v.string(),
    attachments: v.optional(v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    }))),
    createdAt: v.number(),
  })
    .index("by_uuid", ["uuid"])
    .index("by_chat", ["chatId"])
    .index("by_chat_created", ["chatId", "createdAt"]),
});