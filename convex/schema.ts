import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    displayName: v.optional(v.string()),
    occupation: v.optional(v.string()),
    traits: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
  
  chats: defineTable({
    uuid: v.string(),
    userId: v.string(),
    title: v.string(),
    isPublic: v.boolean(),
    pinned: v.optional(v.boolean()),
    // New fields for branching
    parentChatId: v.optional(v.string()), // UUID of parent chat if this is a branch
    branchFromMessageId: v.optional(v.string()), // Message ID where this branch started
    branchDepth: v.optional(v.number()), // How many levels deep this branch is
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["uuid"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentChatId"]), // New index for finding branches
  
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