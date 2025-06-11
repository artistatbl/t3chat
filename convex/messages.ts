import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createMessage = mutation({
  args: {
    uuid: v.string(),
    chatId: v.string(),
    userId: v.string(),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("messages", {
      uuid: args.uuid,
      chatId: args.chatId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      createdAt: now,
    });
  },
});

export const getMessagesByChat = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat_created", (q) => q.eq("chatId", args.chatId))
      .order("asc")
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

    await ctx.db.patch(message._id, {
      content: args.content,
    });

    return message;
  },
});