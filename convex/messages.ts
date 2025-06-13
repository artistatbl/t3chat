import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createMessage = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("messages", {
      uuid: args.uuid,
      chatId: args.chatId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      attachments: args.attachments,
      createdAt: now,
    });
  },
});

export const getMessagesByChat = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // User not authenticated
    }
    
    const userId = identity.subject;
    
    // First, verify the chat belongs to the user
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.chatId))
      .first();
    
    if (!chat || chat.userId !== userId) {
      return []; // Chat doesn't exist or doesn't belong to the user
    }
    
    // If chat belongs to user, return messages
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc") // This orders by createdAt ascending
      .collect();
  },
});

export const updateMessage = mutation({
  args: {
    uuid: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query("messages")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!message) {
      throw new Error("Message not found");
    }

    // Only update content, keep the original createdAt for ordering
    await ctx.db.patch(message._id, {
      content: args.content,
      // Don't update createdAt to preserve chronological order
    });

    return message;
  },
});