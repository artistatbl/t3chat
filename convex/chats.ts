import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (existingChat) {
      return existingChat;
    }

    const now = Date.now();
    return await ctx.db.insert("chats", {
      uuid: args.uuid,
      userId: args.userId,
      title: args.title,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateChatTitle = mutation({
  args: {
    uuid: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    await ctx.db.patch(chat._id, {
      title: args.title,
      updatedAt: Date.now(),
    });

    return chat;
  },
});

export const getChatByUuid = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();
  },
});

export const getChatsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});